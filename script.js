document.addEventListener('DOMContentLoaded', () => {

    // --- State and Constants ---
    const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const COLS = Array.from({ length: 12 }, (_, i) => i + 1);
    let copyBuffer = null; // Will store the copied 2D array

    // --- Get DOM Elements ---
    const tbody = document.getElementById('plate-tbody');
    const legendUi = document.getElementById('legend_ui');
    const printableArea = document.getElementById('printable-area');

    // --- Date helper: native date input defaults and formatting ---
    const dateInput = document.getElementById('date_input');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        // native date input expects YYYY-MM-DD
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const openDateBtn = document.getElementById('open_date_picker');
    if (openDateBtn && dateInput) {
        openDateBtn.addEventListener('click', () => {
            // showPicker exists in some browsers; fallback to focus()
            if (typeof dateInput.showPicker === 'function') {
                dateInput.showPicker();
            } else {
                dateInput.focus();
            }
        });
    }

    function formatDateForDisplay(rawDate) {
        if (!rawDate) return '-';
        // If already in MM/DD/YYYY (user typed manually), return as-is
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) return rawDate;
        // Expecting YYYY-MM-DD from native date input
        const m = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            return `${m[2]}/${m[3]}/${m[1]}`;
        }
        return rawDate; // fallback
    }

    // --- Helper Functions (Ported from R + Shiny JS) ---

    // simple string -> H (hue) hash function; returns HSL color string
    function strToHslColor(str, s, l) {
        if (!str) return 'hsl(0, 0%, 100%)'; // white for empty
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var h = Math.abs(hash) % 360;
        return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }

    // Given a value, compute background color (light saturation/brightness)
    function colorForValue(val) {
        if (!val || val.trim() === '') {
            return '#ffffff';
        }
        return strToHslColor(val.toString(), 60, 82);
    }

    // update background color for an input element based on its value
    function updateCellStyle(el) {
        var v = el.value;
        el.style.backgroundColor = colorForValue(v);
    }

    // Parse a cell string like "A1" -> {row: "A", col: 1, r_idx: 0, c_idx: 0}
    function parseCell(cellStr) {
        if (!cellStr || typeof cellStr !== 'string') return null;
        cellStr = cellStr.toUpperCase().trim();

        const match = cellStr.match(/^([A-H])([1-9]|1[0-2])$/);
        if (!match) return null;

        const row = match[1];
        const col = parseInt(match[2], 10);

        return {
            row: row,
            col: col,
            r_idx: ROWS.indexOf(row), // 0-based row index
            c_idx: col - 1             // 0-based col index
        };
    }

    // Expand selection rectangle defined by start and end cells (inclusive)
    // Returns an array of {row: 'A', col: 1} objects
    function expandSelection(startCellStr, endCellStr) {
        const s = parseCell(startCellStr);
        const e = parseCell(endCellStr);

        if (!s || !e) return null;

        const rMin = Math.min(s.r_idx, e.r_idx);
        const rMax = Math.max(s.r_idx, e.r_idx);
        const cMin = Math.min(s.c_idx, e.c_idx);
        const cMax = Math.max(s.c_idx, e.c_idx);

        let selection = [];
        for (let r = rMin; r <= rMax; r++) {
            for (let c = cMin; c <= cMax; c++) {
                selection.push({
                    row: ROWS[r],
                    col: COLS[c]
                });
            }
        }
        return selection;
    }

    // Get the value of a specific cell
    function getCell(row, col) {
        const el = document.getElementById(`cell_${row}${col}`);
        return el ? el.value : '';
    }

    // Set the value of a specific cell and update its style
    // Does NOT dispatch the input event, to allow for batch updates
    function setCell(row, col, value) {
        const el = document.getElementById(`cell_${row}${col}`);
        if (el) {
            el.value = value;
            updateCellStyle(el);
        }
    }

    // --- Core UI Functions ---

    function updateLegend() {
        const cells = document.querySelectorAll('.plate-cell');
        const values = new Set();
        cells.forEach(el => {
            if (el.value && el.value.trim() !== '') {
                values.add(el.value.trim());
            }
        });

        legendUi.innerHTML = ''; // Clear current legend

        if (values.size === 0) {
            legendUi.innerHTML = '<div>No filled wells</div>';
            return;
        }

        const sortedValues = Array.from(values).sort();
        sortedValues.forEach(k => {
            const color = colorForValue(k);
            const item = document.createElement('span');
            item.style = "display:inline-flex; align-items:center; margin-right:8px; margin-bottom: 4px;";

            const swatch = document.createElement('span');
            swatch.style = `width:18px; height:18px; border-radius:4px; background:${color}; display:inline-block; margin-right:6px; border:1px solid rgba(0,0,0,0.08);`;

            const label = document.createElement('span');
            label.style = "font-size:12px; vertical-align:middle;";
            label.textContent = k;

            item.appendChild(swatch);
            item.appendChild(label);
            legendUi.appendChild(item);
        });
    }

    function createPlateGrid() {
        // Check if tbody exists before trying to clear it
        if (tbody) {
            tbody.innerHTML = ''; // Clear any existing content
            ROWS.forEach(r => {
                const tr = document.createElement('tr');

                // Row header
                const th = document.createElement('td');
                th.textContent = r;
                tr.appendChild(th);

                // Cell inputs
                COLS.forEach(c => {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'plate-cell';
                    input.id = `cell_${r}${c}`;

                    // Add listener to update color and legend on manual input
                    input.addEventListener('input', () => {
                        updateCellStyle(input);
                        updateLegend();
                    });

                    td.appendChild(input);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
    }

    // --- Event Handlers (Ported from R Observers) ---

    const copyBtn = document.getElementById('copy_sel_btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const sel = expandSelection(
                document.getElementById('sel_start').value,
                document.getElementById('sel_end').value
            );

            if (!sel) {
                alert("Invalid selection. Use e.g. A1 and A12.");
                return;
            }

            // Get unique rows/cols to determine matrix dimensions
            const selRows = [...new Set(sel.map(c => c.row))].sort();
            const selCols = [...new Set(sel.map(c => c.col))].sort((a,b) => a - b);

            const nRows = selRows.length;
            const nCols = selCols.length;

            let buffer = Array(nRows).fill(null).map(() => Array(nCols));

            for (let r = 0; r < nRows; r++) {
                for (let c = 0; c < nCols; c++) {
                    buffer[r][c] = getCell(selRows[r], selCols[c]);
                }
            }

            copyBuffer = buffer;
            alert(`Copied selection (${nRows} x ${nCols}) to buffer.`);
        });
    }

    const pasteBtn = document.getElementById('paste_sel_btn');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', () => {
            if (!copyBuffer) {
                alert("Copy buffer is empty. Use 'Copy Selection' first.");
                return;
            }

            const targ = parseCell(document.getElementById('paste_target').value);
            if (!targ) {
                alert("Invalid paste target. Use e.g. A1.");
                return;
            }

            const nRows = copyBuffer.length;
            const nCols = copyBuffer[0].length;

            // Check bounds
            if (targ.r_idx + nRows > ROWS.length || targ.c_idx + nCols > COLS.length) {
                alert("Buffer does not fit at target location (out of plate bounds).");
                return;
            }

            for (let r = 0; r < nRows; r++) {
                for (let c = 0; c < nCols; c++) {
                    const targetRow = ROWS[targ.r_idx + r];
                    const targetCol = COLS[targ.c_idx + c];
                    const value = copyBuffer[r][c];
                    setCell(targetRow, targetCol, value);
                }
            }

            updateLegend(); // Update legend once after batch paste
            alert("Pasted buffer to target location.");
        });
    }

    const clearBtn = document.getElementById('clear_sel_btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const sel = expandSelection(
                document.getElementById('sel_start').value,
                document.getElementById('sel_end').value
            );

            if (!sel) {
                alert("Invalid selection to clear.");
                return;
            }

            sel.forEach(cell => {
                setCell(cell.row, cell.col, "");
            });

            updateLegend(); // Update legend once after batch clear
            alert("Selection cleared.");
        });
    }

    const patternBtn = document.getElementById('pattern_fill_btn');
    if (patternBtn) {
        patternBtn.addEventListener('click', () => {
            const sel = expandSelection(
                document.getElementById('sel_start').value,
                document.getElementById('sel_end').value
            );

            if (!sel) {
                alert("Invalid selection for pattern fill.");
                return;
            }

            const patternType = document.getElementById('pattern_type').value;
            const repeatVal = document.getElementById('pattern_repeat_value').value;
            let currentVal = parseFloat(document.getElementById('pattern_start').value);
            const stepVal = parseFloat(document.getElementById('pattern_step').value);

            if (patternType === 'Repeat value') {
                sel.forEach(cell => {
                    setCell(cell.row, cell.col, repeatVal);
                });
            }
            else if (patternType === 'Sequence row-wise') {
                const selRows = [...new Set(sel.map(c => c.row))].sort();
                const selCols = [...new Set(sel.map(c => c.col))].sort((a,b) => a - b);

                for (const r of selRows) {
                    for (const c of selCols) {
                        setCell(r, c, String(currentVal));
                        currentVal += stepVal;
                    }
                }
            }
            else if (patternType === 'Sequence column-wise') {
                const selRows = [...new Set(sel.map(c => c.row))].sort();
                const selCols = [...new Set(sel.map(c => c.col))].sort((a,b) => a - b);

                for (const c of selCols) {
                    for (const r of selRows) {
                        setCell(r, c, String(currentVal));
                        currentVal += stepVal;
                    }
                }
            }

            updateLegend(); // Update legend once after batch fill
            alert("Pattern applied to selection.");
        });
    }

    const refreshLegendBtn = document.getElementById('refresh_legend');
    if (refreshLegendBtn) {
        refreshLegendBtn.addEventListener('click', () => {
            updateLegend();
            alert("Legend refreshed.");
        });
    }

    // --- Download Handler (Replaces ggplot/gridExtra) ---
    const downloadBtn = document.getElementById('downloadImage');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // 1. Get user inputs
            const rawDate = (dateInput && dateInput.value) ? dateInput.value : "-";
            const date = formatDateForDisplay(rawDate);
            const plate = document.getElementById('plate_input').value || "-";
            // Map R's font size (1-8) to a reasonable CSS font size (6pt-20pt)
            const fontSizeVal = parseFloat(document.getElementById('font_size').value);
            const cssFontSize = (fontSizeVal * 2 + 4) + 'pt';

            // 2. Clear and build the hidden printable div
            printableArea.innerHTML = '';

            // Ensure the printableArea is off-screen but renderable
            printableArea.style.position = 'absolute';
            printableArea.style.left = '-9999px';
            printableArea.style.top = '0';
            printableArea.style.visibility = 'visible';
            printableArea.style.background = '#ffffff';
            printableArea.style.padding = '12px';
            printableArea.style.maxWidth = '1200px';

            // Add Logo and Header
            const h2 = document.createElement('h2');
            h2.textContent = '🧬 BioPathogenix';
            printableArea.appendChild(h2);

            const h3 = document.createElement('h3');
            h3.textContent = `DATE: ${date}  |  PLATE: ${plate}`;
            printableArea.appendChild(h3);

            // Create table
            const printTable = document.createElement('table');
            printTable.id = 'print-table';
            printTable.style.borderCollapse = 'collapse';
            printTable.style.width = '100%';
            printTable.style.fontFamily = 'Arial, sans-serif';

            // Table Header (1-12)
            const thead = document.createElement('thead');
            let trHead = document.createElement('tr');

            const cornerTh = document.createElement('th');
            cornerTh.style.border = '1px solid #e6eef6';
            cornerTh.style.padding = '6px';
            trHead.appendChild(cornerTh); // empty corner
            COLS.forEach(c => {
                let th = document.createElement('th');
                th.textContent = c;
                th.style.border = '1px solid #e6eef6';
                th.style.padding = '6px';
                th.style.textAlign = 'center';
                trHead.appendChild(th);
            });
            thead.appendChild(trHead);
            printTable.appendChild(thead);

            // Table Body (A-H, with values)
            const printTbody = document.createElement('tbody');
            ROWS.forEach(r => {
                let tr = document.createElement('tr');
                let th = document.createElement('td');
                th.className = 'row-header';
                th.textContent = r;
                th.style.border = '1px solid #e6eef6';
                th.style.padding = '6px';
                tr.appendChild(th);

                COLS.forEach(c => {
                    let td = document.createElement('td');
                    const liveCell = document.getElementById(`cell_${r}${c}`);
                    td.textContent = liveCell ? liveCell.value : '';
                    td.style.backgroundColor = (liveCell && liveCell.style.backgroundColor) ? liveCell.style.backgroundColor : '#ffffff';
                    td.style.fontSize = cssFontSize;
                    td.style.border = '1px solid #e6eef6';
                    td.style.padding = '6px';
                    td.style.textAlign = 'center';
                    tr.appendChild(td);
                });
                printTbody.appendChild(tr);
            });
            printTable.appendChild(printTbody);
            printableArea.appendChild(printTable);

            // Add Legend (cloned from live legend)
            // We clone the items but keep the swatch color
            const legendItems = legendUi.querySelectorAll('span');
            if (legendItems.length > 0) {
                const legendTitle = document.createElement('h5');
                legendTitle.textContent = 'Legend:';
                printableArea.appendChild(legendTitle);

                legendItems.forEach(item => {
                    // each item we created earlier uses inline children [swatch, label]
                    const clone = document.createElement('div');
                    clone.style.display = 'inline-flex';
                    clone.style.alignItems = 'center';
                    clone.style.marginRight = '8px';
                    clone.style.marginBottom = '4px';
                    clone.style.marginTop = '6px';

                    const swatch = item.querySelector('span');
                    const label = item.querySelector('span:last-child');

                    const sw = document.createElement('span');
                    if (swatch) {
                        sw.style = swatch.style.cssText;
                    } else {
                        sw.style = 'width:18px; height:18px; border-radius:4px; background:#ffffff; display:inline-block; margin-right:6px; border:1px solid rgba(0,0,0,0.08);';
                    }
                    sw.style.display = 'inline-block';
                    sw.style.marginRight = '6px';
                    sw.style.width = '18px';
                    sw.style.height = '18px';
                    sw.style.borderRadius = '4px';

                    const lbl = document.createElement('span');
                    lbl.textContent = label ? label.textContent : '';
                    lbl.style.fontSize = '12px';
                    lbl.style.verticalAlign = 'middle';

                    clone.appendChild(sw);
                    clone.appendChild(lbl);
                    printableArea.appendChild(clone);
                });
            }

            // 3. Use html2canvas, but with a slightly longer delay to ensure render
            //    and with CORS/taint options to reduce failures.
            setTimeout(() => {
                if (typeof html2canvas === 'undefined') {
                    console.error('html2canvas is not loaded. Make sure the CDN script is reachable.');
                    alert('html2canvas library not loaded. If you are running the file locally, try using a local server (e.g., `npx serve`) so external scripts load correctly.');
                    return;
                }

                html2canvas(printableArea, {
                    scale: 2.5,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false,
                    allowTaint: false
                })
                .then(canvas => {
                    // 4. Trigger download
                    const link = document.createElement('a');
                    link.download = `plate-layout-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL('image/png');
                    // Append to body to make click work reliably in some browsers
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                })
                .catch(err => {
                    console.error('Error generating canvas:', err);
                    alert('Error generating image. See console for details.');
                });
            }, 600); // increased delay to 600ms

        });
    }

    // --- Initial App Load ---
    createPlateGrid();
    updateLegend();

}); // End DOMContentLoaded
