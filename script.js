document.addEventListener('DOMContentLoaded', () => {

    // --- State and Constants ---
    const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const COLS = Array.from({ length: 12 }, (_, i) => i + 1);

    // Comprehensive Pathogen List matching your reference list
    const PATHOGENS = [
        "Giardia lamblia", "Enterobacter cloacae", "Klebsiella pneumoniae", "Enterococcus faecium",
        "Proteus mirabilis", "Klebsiella oxytoca", "Morganella morganii", "Acinetobacter baumannii",
        "Proteus vulgaris", "Escherichia coli", "Klebsiella aerogenes", "Citrobacter freundii",
        "Providencia stuartii", "Enterococcus faecalis", "Staphylococcus aureus",
        "Streptococcus pyogenes; MGAS10270; MGAS 10270", "Staphylococcus saprophyticus",
        "Serratia marcescens", "Clostridium septicum; Pasteur III", "Clostridium perfringens; NCTC 8237",
        "C. difficile-027", "Bacillus subtilis", "Moraxella catarrhalis; Ne 11", "Streptococcus agalactiae",
        "Streptococcus pneumoniae", "Streptococcus equisimilis", "Haemophilus influenzae B (b); AMC 36-A-1",
        "Legionella longbeachae; Long Beach 4", "Legionella pneumophila; Philadelphia-1", "Bordetella pertussis;F",
        "Bordetella parapertussis; NCTC 5952", "Clostridium novyi; VPI 5273-1", "Bordetella holmesii; CDC F5101",
        "Pseudomonas aeruginosa", "Haemophilus influenzae; L-378", "Neisseria gonorrhoeae; CDC Ng-116",
        "Escherichia coli -011NM -EPEC (Enteropathogenic E. coli)", "Streptococcus mitis",
        "Escherichia coli 011G; CDC 3250-76", "Escherichia coli -078:H11 (Enterotoxin); H10407",
        "Vibrio cholerae pacini; NCTC 8021", "Bacteroides fragilis; VPI 2553", "Candida krusei",
        "Candida albicans; 3147", "Candida glabrata; CBS 138",
        "Candida tropicalis; BI CZAS 0651/2, CCY 29-7-7, NRRL Y-11860, VTT C-78086",
        "Clavispora lusitaniae (Previously Candida lusitaniae); IFO 1019", "Candida auris",
        "Candida parapsilosis; CBS 604", "Kingella kingae; 4177/66", "Staphylococcus epidermidis; FDA strain PCI 1200",
        "Trichophyton interdigitale; 640", "Escherichia coli Sterotype o111a; CDC 3250-76",
        "S. flexneri Serotype 2a; 24570/ Shigella flexneri Castellani and Chalmers (Positive for EIEC)",
        "Salmonella spps.; X-142", "Yersinia enterocolitica subsp. Enterocolitica; 33114",
        "Escherichia coli H10407 (Enterotoxin); H10407", "Listeria monocytogenes; Gibson",
        "Proteus mirabilis; D1", "Providencia stuartii; 495", "Klebsiella pneumoniae; UMJMH14",
        "Klebsiella oxytoca; 479-2", "Streptococcus equisimilis (C); Grouping strain C74/ Streptococcus dysgalactiae subsp. equisimilis",
        "Streptococcus agalactiae (B); NADC 44", "Staphylococcus saprophyticus; NCTC 7292",
        "Serratia marcescens; BS 303", "Enterobacter aerogenes; NCDC 819-56", "Pseudomonas aeruginosa; CCEB 481",
        "Campylobacter jejuni; NCTC 11168", "Prevotella bivia; VPI 6822", "Gardnerella vaginalis; 594",
        "Lactobacillus iners #3", "Microsporum audouinii; 243", "Trichophyton tonsurans; CDC B-3220",
        "Microsporum gypseum; PCI M-82", "Epidermophyton floccosum; 1282", "Microsporum canis; A 3697 (2)",
        "Mobiluncus curtisii; BV 345-16", "Atopobium vaginae; CCUG 38953  (Fannyhessea vaginae)",
        "Staphylococcus lugdunensis; LRA 260.05.79", "Staphylococcus haemolyticus; SM 131",
        "Klebsiella aerogenes; NCDC 819-56", "Ureaplasma urealyticum; T-strain 960 (CX8)", "Ureapalsma parvum; 7",
        "Metamycoplasma hominis (Previously Mycoplasma hominis); H27", "Klebsiella ozaenae",
        "Vibrio vulnificus; 324", "Vibrio parahaemolyticus; EB101", "Megasphaera elsdenii; BE2-2083",
        "Streptococccus pneumoniae; SVI", "Megasphaera hutchinsoni Srinivasan (TYPE 2); KA00182",
        "Campylobacter coli; CIP 7080", "Helocobacter pylori; NCTC 11637", "Plesiomonas shigelloides; CDC 3085-55",
        "Shigella sonnei; AMC 43-GG9", "Mycoplasmoides genitalium (Previously Mycoplasma genitalium); G37",
        "Streptococcus equisimilis (C); Grouping strain C74", "Staphylococcus aureus; UT 32",
        "Enterococcus faecalis; Taxo 239", "Staphylococcus aureus; M10/0061", "Enterobacter cloacae; 1101152",
        "Staphylococcus aureus; Mu50", "Escherichia coli; FDA strain Seattle 1946",
        "Klebsiella pneumoniae; bMx# 1103199", "Escherichia coli; bMx# 1109131", "Enterobacter cloacae; CDC 442-68",
        "Mycoplasmoides pneumoniae (Previously Mycoplasma pneumoniae); FH strain of Eaton Agent",
        "Haemophilus ducreyi; CIP 542", "Yersinia enterocolitica; Billups-1803-68", "Yersinia enterocolitica; 33114",
        "Salmonella bongori; CIP 82.33", "S. agalactiae Bio-020 Devi", "Lactobacillus iners #6",
        "Lactobacillus iners #7", "Enterococcus faecalis; PCI 1325", "Morganella morganii; M4",
        "Morganella morganii; M11", "Citrobacter freundii; LRA 117.03.76",
        "Streptococcus pyogenes (A,1); Typing strain T1", "Trichopyton violaceum; VH/72-9921",
        "Neoscytalidium dimidiatum; 3", "Trichophyton rubrum; 379", "Aspergillus terreus; NRRL 255",
        "Fusarium solani;F228", "Escherichia coli (O157) ;CDC B6914-MS1", "Aspergillus niger; WB 326",
        "Sarocladium strictum; 42-765 A", "Corynebacterium striatum (chester) Eberson; NCTC 764",
        "Corynebacterium urealyticum Pitcher et al.; 1", "Escherichia coli (Migula)Castellani and Chalmers; J53 pMG224",
        "Escherichia coli (Migula)Castellani and Chalmers; 1101362",
        "Enterococcus faecium (Orla-Jensen)Schleifer and Kilpper Balz; VRE", "Aerococcus urinae Aguirre and Collins;  NCFB 2893",
        "Proteus vulgaris; Proteus vulgaris Hauser emend. Judicial Commission", "Enterococcus faecium;VRE",
        "Aspergillus fumigatus Fresenius; NRRL 163", "Aspergillus versicolor (Vuilemin) Tiraboschi;QM 432",
        "Prevotella loescheii (Holdeman&Johnson); 8B", "Alternaria alternata; Alternaria tenuis Nees",
        "Microspsorum audouinii; Microsporum audouinii Gruby", "Cutibacterium acnes; NCTC 737",
        "Epidermophyton floccosum; NIH 1214", "Peptostreptococcus anaerobius; VPI 4330",
        "Stenotrophomonas maltophilia; 300", "Streptococcus dysgalactiae; NCDO 2023",
        "Fusobacterium necrophorum subsp necrophorum; VPI 2891", "Fusobacterium nucleatum subsp nucleatum; VPI 4355",
        "Geotrichum candidum; UAMH 7863", "Malassezia furfur; CBS 1878", "Candida dubliniensis ; CBS 7987",
        "Meyerozyma guilliermondii; [ATCC 7350, CBS 566, DBVPG 6140, IFO 10279, IGC 2730, JCM 1539, NRRL Y-11860, VTT C-78086]",
        "Zygosaccharomyces rouxii; 59-4", "Citrobacter koseri; CDC 3613-63", "Arthroderma vanbreuseghemii ; SM 7432",
        "Candida dubliniensis; CBS 7987", "Neisseria gonorrhoeae", "Klebsiella ozaenae / Klebsiella pneumoniae",
        "Acinetobacter baumanii", "Klebsiella  aerogenes", "Klebsiella  pneumoniae", "Providencia  rettgeri",
        "Scopulariopsis brevicaulis; IMI 49528", "Mycobacterium tuberculosis; H37Ra", "Salmonella senftenberg",
        "Oligella urethralis; CDC 7603", "Enterobacter cloacae group", "Raoultella ornithinolytica",
        "Kluyvera ascorbata", "Klebsiella  oxytoca", "C. freundii/Citrobacter species", "Corynebacterium riegelii; CIP 105310",
        "Corynebacterium pyruviciproducens  (label says Coynebaterium spps); WAL06-1773O",
        "Corynebacterium diphtheriae; D11", "Enterobacter cloacae complex", "Salmonella albert",
        "Salmonella cubana", "Salmonella stanley", "Salmonella heidelberg", "Salmonella corvallis",
        "Salmonella concord", "Salmonella typhimurium", "Salmonella infantis", "Campylobacter coli",
        "Campylobacter jejuni", "Shigella flexneri", "Shigella sonnei", "Escherichia coli 0157",
        "Salmonella Enteritidis", "Enterococcus  avium", "Aspergillus flavus"
    ];

    // --- Get DOM Elements ---
    const tbody = document.getElementById('plate-tbody');
    const printableArea = document.getElementById('printable-area');
    const pathogenListDatalist = document.getElementById('pathogen-list');

    // Populate the datalist options once
    if (pathogenListDatalist) {
        PATHOGENS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            pathogenListDatalist.appendChild(opt);
        });
    }

    // --- Date helper: native date input defaults and formatting ---
    const dateInput = document.getElementById('date_input');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const openDateBtn = document.getElementById('open_date_picker');
    if (openDateBtn && dateInput) {
        openDateBtn.addEventListener('click', () => {
            if (typeof dateInput.showPicker === 'function') {
                dateInput.showPicker();
            } else {
                dateInput.focus();
            }
        });
    }

    function formatDateForDisplay(rawDate) {
        if (!rawDate) return '-';
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) return rawDate;
        const m = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            return `${m[2]}/${m[3]}/${m[1]}`;
        }
        return rawDate;
    }

    // --- Helper Functions ---
    function strToHslColor(str, s, l) {
        if (!str) return 'hsl(0, 0%, 100%)';
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var h = Math.abs(hash) % 360;
        return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }

    function colorForValue(val) {
        if (!val || val.trim() === '') {
            return '#ffffff';
        }
        return strToHslColor(val.toString(), 60, 82);
    }

    function updateCellStyle(el) {
        var v = el.value;
        el.style.backgroundColor = colorForValue(v);
    }

    function createPlateGrid() {
        if (tbody) {
            tbody.innerHTML = '';
            ROWS.forEach(r => {
                const tr = document.createElement('tr');

                const th = document.createElement('td');
                th.textContent = r;
                tr.appendChild(th);

                COLS.forEach(c => {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'plate-cell';
                    input.id = `cell_${r}${c}`;

                    input.setAttribute('list', 'pathogen-list');

                    input.addEventListener('input', () => {
                        updateCellStyle(input);
                    });

                    td.appendChild(input);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
    }

    // --- Download Handler ---
    const downloadBtn = document.getElementById('downloadImage');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const rawDate = (dateInput && dateInput.value) ? dateInput.value : "-";
            const date = formatDateForDisplay(rawDate);
            const plate = document.getElementById('plate_input').value || "-";
            const fontSizeVal = parseFloat(document.getElementById('font_size').value);
            const cssFontSize = (fontSizeVal * 2 + 4) + 'pt';

            printableArea.innerHTML = '';
            // Temporarily make the area visible to the layout engine offscreen
            printableArea.style.display = 'block';
            printableArea.style.position = 'fixed';
            printableArea.style.left = '0';
            printableArea.style.top = '0';
            printableArea.style.zIndex = '99999';
            printableArea.style.background = '#ffffff';
            printableArea.style.padding = '12px';
            printableArea.style.width = '1000px';

            const h2 = document.createElement('h2');
            h2.textContent = '🧬 BioPathogenix';
            printableArea.appendChild(h2);

            const h3 = document.createElement('h3');
            h3.textContent = `DATE: ${date}  |  PLATE: ${plate}`;
            printableArea.appendChild(h3);

            const printTable = document.createElement('table');
            printTable.id = 'print-table';
            printTable.style.borderCollapse = 'collapse';
            printTable.style.width = '100%';
            printTable.style.fontFamily = 'Arial, sans-serif';

            const thead = document.createElement('thead');
            let trHead = document.createElement('tr');

            const cornerTh = document.createElement('th');
            cornerTh.style.border = '1px solid #e6eef6';
            cornerTh.style.padding = '6px';
            trHead.appendChild(cornerTh);
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

            setTimeout(() => {
                if (typeof html2canvas === 'undefined') {
                    console.error('html2canvas is not loaded.');
                    alert('html2canvas library not loaded.');
                    printableArea.style.display = 'none';
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
                    const link = document.createElement('a');
                    link.download = `plate-layout-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    printableArea.style.display = 'none';
                })
                .catch(err => {
                    console.error('Error generating canvas:', err);
                    alert('Error generating image.');
                    printableArea.style.display = 'none';
                });
            }, 300);
        });
    }

    // --- Initial App Load ---
    createPlateGrid();

});
