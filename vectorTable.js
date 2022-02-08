const theProjectName = "[vectorTable]"
const theXmlns = "http://www.w3.org/2000/svg";
let elements = new Array(); 

const class_vtTable = "_vtTable";

const zoom_delta = 1.1;

//Window Resize Event
let _vtResizeWindow = function(event)
{
    elements.forEach(elem =>{
        let elemWidth = elem.getBoundingClientRect().width;
        let elemHeight = elem.getBoundingClientRect().height;
        let viewBoxText = "0 0 " + elemWidth + " " + elemHeight;

        let ef = elem.firstElementChild;
        let old_width = Number(ef.getAttribute("width"));
        let old_height = Number(ef.getAttribute("height"));
        ef.setAttribute("width", elemWidth);
        ef.setAttribute("height", elemHeight);
        ef.setAttribute("viewBox", viewBoxText);

        let rects = ef.querySelectorAll("rect");
        Array.from(rects).forEach(rect =>{
            let old_x = Number(rect.getAttribute("x"));
            rect.setAttribute("x", old_x * elemWidth / old_width);

            let old_y = Number(rect.getAttribute("y"));
            rect.setAttribute("y", old_y * elemHeight / old_height);

            let old_w = Number(rect.getAttribute("width"));
            rect.setAttribute("width", old_w * elemWidth / old_width);

            let old_h = Number(rect.getAttribute("height"));
            rect.setAttribute("height", old_h * elemHeight / old_height)
        });

        let lines = ef.querySelectorAll("line");
        Array.from(lines).forEach(line =>{
            let old_x1 = Number(line.getAttribute("x1"));
            line.setAttribute("x1", old_x1 * elemWidth / old_width);

            let old_x2 = Number(line.getAttribute("x2"));
            line.setAttribute("x2", old_x2 * elemWidth / old_width);

            let old_y1 = Number(line.getAttribute("y1"));
            line.setAttribute("y1", old_y1 * elemHeight / old_height);

            let old_y2 = Number(line.getAttribute("y2"));
            line.setAttribute("y2", old_y2 * elemHeight / old_height);
        });
    });
}

window.addEventListener('resize', _vtResizeWindow);

//mouse wheel Event
let _vtZoomByWheel = function(event)
{
    event.preventDefault();

    let table = event.target;
    while(!table.classList.contains(class_vtTable)){
        table = table.parentElement;
    }
    let table_view = table.getAttribute("viewBox").split(" ");
    let table_w = Number(table.getAttribute("width"));
    let table_h = Number(table.getAttribute("height"));

    let pt = table.createSVGPoint();
    pt.x = event.x;
    pt.y = event.y;

    let pt_table = pt.matrixTransform(table.getScreenCTM().inverse());

    let new_view_w;
    let new_view_h;
    let new_view_x;
    let new_view_y;

    if(event.deltaY > 0){
        new_view_w = Number(table_view[2])*zoom_delta;
        new_view_h = Number(table_view[3])*zoom_delta;
        if(new_view_w > table_w){
            new_view_w = table_w;
        }
        if(new_view_h > table_h){
            new_view_h = table_h;
        }

        new_view_x = pt_table.x + (Number(table_view[0]) - pt_table.x)*zoom_delta;
        new_view_y = pt_table.y + (Number(table_view[1]) - pt_table.y)*zoom_delta;

    }else{
        new_view_w = Number(table_view[2])/zoom_delta;
        new_view_h = Number(table_view[3])/zoom_delta;

        new_view_x = pt_table.x + (Number(table_view[0]) - pt_table.x)/zoom_delta;
        new_view_y = pt_table.y + (Number(table_view[1]) - pt_table.y)/zoom_delta;
    }

    if(new_view_x < 0){
        new_view_x = 0;
    }else if(new_view_x + new_view_w > table_w){
        new_view_x = table_w - new_view_w;
    }

    if(new_view_y < 0){
        new_view_y = 0;
    }else if(new_view_y + new_view_h > table_h){
        new_view_y = table_h - new_view_h;
    }

    table_view[0] = new_view_x.toString();
    table_view[1] = new_view_y.toString();
    table_view[2] = new_view_w.toString();
    table_view[3] = new_view_h.toString();
    table.setAttribute("viewBox", table_view.join(" "));
}

let pan_startPt;
let pan_target;
let pan_viewBox;
let pan_target_w, pan_target_h;
let pan_flg;
//mouse Drag Event
//mouse down
let _vtPanMousedown = function(event)
{
    event.preventDefault();
    pan_flg = true;

    pan_target = event.target;
    while(!pan_target.classList.contains(class_vtTable)){
        pan_target = pan_target.parentElement;
    }
    pan_viewBox = pan_target.getAttribute("viewBox").split(" ").map(s => {return Number(s)});
    pan_target_w = Number(pan_target.getAttribute("width"));
    pan_target_h = Number(pan_target.getAttribute("height"));

    let pt = pan_target.createSVGPoint();
    pt.x = event.x;
    pt.y = event.y;

    start_Pt = pt.matrixTransform(pan_target.getScreenCTM().inverse());
}

//mouse move
let _vtPanMouseMove = function(event)
{
    if(pan_flg){
        let pt = pan_target.createSVGPoint();
        pt.x = event.x;
        pt.y = event.y;

        new_pt = pt.matrixTransform(pan_target.getScreenCTM().inverse());
        let dx = new_pt.x - start_Pt.x;
        let dy = new_pt.y - start_Pt.y;
        pan_viewBox = [pan_viewBox[0] - dx, pan_viewBox[1] - dy, pan_viewBox[2], pan_viewBox[3]];

        if(pan_viewBox[0] < 0){
            pan_viewBox[0] = 0;
        }else if(pan_viewBox[0] + pan_viewBox[2] > pan_target_w){
            pan_viewBox[0] = pan_target_w - pan_viewBox[2];
        }

        if(pan_viewBox[1] < 0){
            pan_viewBox[1] = 0;
        }else if(pan_viewBox[1] + pan_viewBox[3] > pan_target_h){
            pan_viewBox[1] = pan_target_h - pan_viewBox[3];
        }

        pan_target.setAttribute("viewBox", pan_viewBox.join(" "));
    }
}

//mouse up
let _vtMouseUp = function(event)
{
    pan_flg = false;
}

document.addEventListener('mouseup', _vtMouseUp);

//check setting
let _vtCheckSetting = function(setting)
{
    //If No id key
    if(!("id" in setting)){
        throw "No 'id' in setting " + theProjectName;
    }

    //If No element
    let elem = document.getElementById(setting.id);
    if(elem==null)
    {
        throw "No 'element' id=" + setting.id + " " + theProjectName;
    }
}

//Divide Header based on col_span and col_span
let _vtDivideHeader = function(header)
{
    if(toString.call(header) != "[object Array]"){
        throw "Header data is not Array " + theProjectName;
    }

    let divideData = new Array();
    let flg_matrix = false;

    header.forEach(h1 =>{
        if(toString.call(h1) == "[object Array]"){//more than 2 lines
            flg_matrix = true;
            return true;
        }
        else if(toString.call(h1) == "[object Object]"){//only 1 line
            let lineData = new Array();
            header.forEach(elem =>{
                if("row_span" in elem){
                    if(elem.row_span < 1){
                        throw "row_span has to be 1 or more " + theProjectName;
                    }
                    lineData.push(elem);
                    for(let i=1; i<elem.row_span; i++){
                        lineData.push(new Object());
                    }
                }
            });
            divideData.push(lineData);
            return true;
        }
    });

    if(flg_matrix){
        for(let i=0; i<header.length; i++){
            let row = new Array();
            divideData.push(row);
        }

        for(let i=0; i<header.length; i++){
            for(let j=0; j<header[i].length; j++){
                if(toString.call(header[i][j]) != "[object Object]"){
                    throw "header has a worng data " + theProjectName;
                }

                if("row_span" in header[i][j]){//If row span is 1 or more
                    if(header[i][j].row_span < 1){
                        throw "row span has to be 1 or more " + theProjectName;
                    }else if(header[i][j].row_span  > header.length - i){
                        throw "row span has to be header row count or less " + theProjectName;
                    }

                    for(let k=i; k<i+header[i][j].row_span; k++){
                        if("col_span" in header[i][j]){//If col span is 1 or more
                            if(header[i][j].col_span < 1){
                                throw "col_span has to be 1 or more " + theProjectName;
                            }
                            divideData[k].push(header[i][j]);
                            for(let l=1; l<header[i][j].col_span; l++){
                                divideData[k].push(new Object());
                            }
                        }else{//If col span is undefined
                            if(k==i){
                                divideData[k].push(header[i][j]);
                            }else{
                                divideData[k].push(new Object());
                            }
                        }
                    }
                }else{//If row span is undefined
                    if("col_span" in header[i][j]){
                        if(header[i][j].col_span < 1){
                            throw "col_span has to be 1 or more " + theProjectName;
                        }
                        divideData[i].push(header[i][j]);
                        for(let k=1; k<header[i][j].col_span; k++){
                            divideData[i].push(new Object());
                        }
                    }else{//If col span is undifined
                        divideData[i].push(header[i][j]);
                    }
                }
            }
        }
    }

    return divideData;
}

let _vtGetTextWH = function(element)
{
    const svg = document.createElementNS(theXmlns, 'svg');
    const g = document.createElementNS(theXmlns, 'g');
    g.setAttribute("name", "content");
    g.appendChild(element);
    svg.appendChild(g);

    document.body.appendChild(svg);
    const box = svg.querySelector("[name=content").getBBox();

    svg.remove();

    return [box.width, box.height];
}

let _vtGetTextWHList = function(setting, divideHeader, body)
{
    let cellDataMatrix = new Array();

    //header
    divideHeader.forEach(line =>{
        let cellDataVector = new Array();
        line.forEach(cell =>{
            let cellData = new Object();
            if("value" in cell){
                let text = document.createElementNS(theXmlns, "text");
                text.setAttribute('x', 0);
                text.setAttribute('y', 0);
                text.setAttribute('font-size', setting.text_font_size);
                text.setAttribute("stroke", setting.text_font_stroke);
                text.setAttribute("stroke-width", setting.text_font_stroke_width);
                text.textContent = cell.value;

                [cellData.w, cellData.h] = _vtGetTextWH(text);
                if("col_span" in cell){
                    cellData.w /= cell.col_span;
                }
                text.remove();
            }else{
                cellData.w = 0;
                cellData.h = 0;
            }
            cellDataVector.push(cellData);
        });
        cellDataMatrix.push(cellDataVector);
    });

    for(let i=0; i<divideHeader.length; i++){
        for(let j=0; j<divideHeader[i].length; j++){
            cellDataMatrix[i][j].row = true;
            cellDataMatrix[i][j].col = true;
        }
    }

    for(let i=0; i<divideHeader.length; i++){
        for(let j=0; j<divideHeader[i].length; j++){
            if("col_span" in divideHeader[i][j]){
                for(let k=1; k<divideHeader[i][j].col_span; k++){
                    cellDataMatrix[i][j+k] = JSON.parse(JSON.stringify(cellDataMatrix[i][j]));
                }
                for(let k=0; k<divideHeader[i][j].col_span-1; k++){
                    cellDataMatrix[i][j+k].col = false;
                }
            }
            if("row_span" in divideHeader[i][j]){
                for(let k=1; k<divideHeader[i][j].row_span; k++){
                    cellDataMatrix[i+k][j] = JSON.parse(JSON.stringify(cellDataMatrix[i][j]));
                }
                for(k=0; k<divideHeader[i][j].row_span-1; k++){
                    cellDataMatrix[i+k][j].row = false;
                }
            }
        }
    }

    //body
    body.forEach(line =>{
        let cellDataVector = new Array();
        line.forEach(cell =>{
            let cellData = new Object();

            let text = document.createElementNS(theXmlns, "text");
            text.setAttribute('x', 0);
            text.setAttribute('y', 0);
            text.setAttribute('font-size', setting.text_font_size);
            text.setAttribute("stroke", setting.text_font_stroke);
            text.setAttribute("stroke-width", setting.text_font_stroke_width);

            //TODO type
            text.textContent = cell;

            [cellData.w, cellData.h] = _vtGetTextWH(text);
            cellData.row = true;
            cellData.col = true;
            text.remove();

            cellDataVector.push(cellData);
        });
        cellDataMatrix.push(cellDataVector);
    });

    return cellDataMatrix;
}

let _vtGetMaxWidthAndHeight = function(cellDataMatrix)
{
    let maxColWidths = new Array(cellDataMatrix[0].length);
    let maxRowHeights = new Array(cellDataMatrix.length);
    
    maxColWidths.fill(0);
    maxRowHeights.fill(0);

    for(let i=0; i<cellDataMatrix.length; i++){
        for(let j=0; j<cellDataMatrix[i].length; j++){
            //Max wight
            if(maxColWidths[j] < cellDataMatrix[i][j].w){
                maxColWidths[j] = cellDataMatrix[i][j].w;
            }

            //Max height
            if(maxRowHeights[i] < cellDataMatrix[i][j].h){
                maxRowHeights[i] = cellDataMatrix[i][j].h;
            }
        }
    }

    return [maxColWidths, maxRowHeights];
}

let _vtSetCharPos = function(setting, cellDataMatrix, maxColWidths, maxRowHeights, numHeaderRow)
{
    let margin_left = 0;
    if("text_margin_left" in setting){
        margin_left = setting.text_margin_left;
    }
    let margin_right = 0;
    if("text_margin_right" in setting){
        margin_right = setting.text_margin_right;
    }

    let col_dir_line_width = 0;
    let col_outer_line_width = 0;
    let col_header_line_width = 0;
    if(!("col_dir_line" in setting) || setting.col_dir_line){
        col_dir_line_width = setting.stroke_width;

        if("outer_frame" in setting){
            if(setting.outer_frame){
                col_outer_line_width = setting.outer_frame_stroke_width;
            }
        }

        if(("header_row" in setting) && setting.header_row){
            col_header_line_width = setting.header_stroke_width;
        }
    }

    let margin_top = 0;
    let row_outer_line_width = 0;
    let row_header_line_width = 0;
    if("text_margin_top" in setting){
        margin_top = setting.text_margin_top;
    }
    let margin_bottom = 0;
    if("text_margin_bottom" in setting){
        margin_bottom = setting.text_margin_bottom;
    }

    let row_dir_line_width = 0;
    if(!("row_dir_line" in setting) || setting.row_dir_line){
        row_dir_line_width = setting.stroke_width;

        if("outer_frame" in setting){
            if(setting.outer_frame){
                row_outer_line_width = setting.outer_frame_stroke_width;
            }
        }

        if(("header_col" in setting) && setting.header_col){
            row_header_line_width = setting.header_stroke_width;
        }
    }

    
    //x direction
    for(let i=0; i<cellDataMatrix.length; i++){
        //text width + margin left
        cellDataMatrix[i][0].x = margin_left;
        for(let j=1; j<cellDataMatrix[i].length; j++){
            cellDataMatrix[i][j].x = cellDataMatrix[i][j-1].x + maxColWidths[j-1];
        }
        //+ margin right
        if(margin_right != 0){
            for(let j=1; j<cellDataMatrix[i].length; j++){
                cellDataMatrix[i][j].x += margin_right * j;
            }
        }
        //+ col dir line width
        if(col_dir_line_width != 0){
            for(let j=0; j<cellDataMatrix[i].length; j++){
                cellDataMatrix[i][j].x += col_dir_line_width * (j+1);
            }
        }
        //+ Outer frame line width
        if(col_outer_line_width != 0){
            let tempWidth = col_outer_line_width - col_dir_line_width;
            for(let j=0; j<cellDataMatrix[i].length; j++){
                cellDataMatrix[i][j].x += tempWidth;
            }
        }
        //+ header line width
        if(col_header_line_width != 0){
            let tempWidth = col_header_line_width - col_dir_line_width;
            for(let j=setting.header_col_pos; j<cellDataMatrix[i].length; j++){
                cellDataMatrix[i][j].x += tempWidth;
            }
        }
    }

    //y direction
    for(let j=0; j<cellDataMatrix[0].length; j++){
        //text height + margin top
        cellDataMatrix[0][j].y = maxRowHeights[0] + margin_top;
        for(let i=1; i<cellDataMatrix.length; i++){
            cellDataMatrix[i][j].y = cellDataMatrix[i-1][j].y + maxRowHeights[i] + margin_top;
        }
        //+ margin bottom
        if(margin_bottom != 0){
            for(let i=1; i<cellDataMatrix.length; i++){
                cellDataMatrix[i][j].y += margin_bottom * i;
            }
        }
        // + row dir line width
        if(row_dir_line_width != 0){
            for(let i=0; i<cellDataMatrix.length; i++){
                cellDataMatrix[i][j].y += row_dir_line_width * (i+1);
            }
        }
        // + Outer frame line width
        if(row_outer_line_width != 0){
            let tempHeight = row_outer_line_width - row_dir_line_width;
            for(let i=0; i<cellDataMatrix.length; i++){
                cellDataMatrix[i][j].y += tempHeight;
            }
        }
        //+ header line width
        if(row_header_line_width != 0){
            let tempHeight = row_header_line_width - row_dir_line_width;
            for(let i=numHeaderRow; i<cellDataMatrix.length; i++){
                cellDataMatrix[i][j].y += tempHeight;
            }
        }
    }
}

let _vtCalSvgSize = function(setting, maxColWidths, maxRowHeights)
{
    let svg_size = new Object();
    svg_size.w = 0;
    svg_size.h = 0;

    //Width
    let flg_colLine = false;
    let numCol = 0;
    if(!("col_dir_line" in setting)){
        flg_colLine = true;
    }else if(setting.col_dir_line){
        flg_colLine = true;
    }

    if(flg_colLine){
        if("outer_frame" in setting){
            if(setting.outer_frame){
                svg_size.w += setting.outer_frame_stroke_width * 2;
                numCol += 2;
            }
        }
        if("header_col" in setting){
            if(setting.header_col){
                svg_size.w += setting.header_stroke_width;
                numCol++;
            }
        }
        let n = maxColWidths.length + 1 - numCol;
        svg_size.w += n * setting.stroke_width;
    }

    let margin_width = 0;
    if("text_margin_right" in setting){
        margin_width += setting.text_margin_right;
    }
    if("text_margin_left" in setting){
        margin_width += setting.text_margin_left;
    }

    maxColWidths.forEach(mw =>{
        svg_size.w += mw + margin_width;
    });

    //height
    let flg_rowLine = false;
    let numRow = 0;
    if(!("row_dir_line" in setting)){
        flg_rowLine = true;
    }else if(setting.row_dir_line){
        flg_rowLine = true;
    }

    if(flg_rowLine){
        if("outer_frame" in setting){
            if(setting.outer_frame){
                svg_size.h += setting.outer_frame_stroke_width * 2;
                numRow += 2;
            }
        }
        if("header_row" in setting){
            if(setting.header_row){
                svg_size.h += setting.header_stroke_width;
                numRow++;
            }
        }
        let n = maxRowHeights.length + 1 - numRow; 
        svg_size.h += n * setting.stroke_width;
    }

    let margin_height = 0;
    if("text_margin_top" in setting){
        margin_height += setting.text_margin_top;
    }
    if("text_margin_bottom" in setting){
        margin_height += setting.text_margin_bottom;
    }

    maxRowHeights.forEach(mh =>{
        svg_size.h += mh + margin_height;
    });

    return svg_size;
}

let _vtCreateAndAppendSVG = function(setting, svg_size)
{
    let elem = document.getElementById(setting.id);

    //Get element's width and height
    let elemWidth = elem.getBoundingClientRect().width;
    let elemHeight = elem.getBoundingClientRect().height;
    let viewBoxText = "0 0 " + elemWidth + " " + elemHeight;

    let asp = Math.min(elemWidth / svg_size.w, elemHeight / svg_size.h);

    //Create SVG
    let svg = document.createElementNS(theXmlns,"svg");
    svg.setAttribute("width", elemWidth);
    svg.setAttribute("height", elemHeight);
    svg.setAttribute("viewBox", viewBoxText);
    svg.setAttribute("_vt-asp", asp);
    svg.classList.add(class_vtTable);

    //Append svg to elem
    elem.appendChild(svg);

    //Add Zoom and Pan Event
    elem.addEventListener('wheel', _vtZoomByWheel);
    elem.addEventListener('mousedown', _vtPanMousedown);
    elem.addEventListener('mousemove', _vtPanMouseMove);

    //Push to Global element array
    elements.push(elem);

    return [svg, asp];
}

let _vtCreateAndAppendBackground = function(svg, setting, svg_size, asp)
{
    let background = document.createElementNS(theXmlns,"rect");
    background.setAttribute("x", 0);
    background.setAttribute("y", 0);
    background.setAttribute("width", svg_size.w * asp);
    background.setAttribute("height", svg_size.h * asp);

    if("background_color" in setting){
        background.setAttribute("fill", setting.background_color)
    }else{
        background.setAttribute("fill", "white");
    }

    svg.appendChild(background);

    return background;
}

let _vtPutContents = function(svg, setting, divideHeader, body, cellDataMatrix, asp, maxRowHeight)
{
    text_font_size = 10;
    if("text_font_size" in setting){
        text_font_size = setting.text_font_size;
    }

    text_font_stroke_width = 0.5;
    if("text_font_stroke_width" in setting){
        text_font_stroke_width = setting.text_font_stroke_width;
    }

    text_font_stroke = "black";
    if("text_font_stroke" in setting){
        text_font_stroke = setting.text_font_stroke;
    }

    //header
    for(let i=0; i<divideHeader.length; i++){
        for(let j=0; j<divideHeader[i].length; j++){
            if("value" in divideHeader[i][j]){
                let text = document.createElementNS(theXmlns,"text");
                text.setAttribute("x", cellDataMatrix[i][j].x*asp);
                text.setAttribute("y", (cellDataMatrix[i][j].y - maxRowHeight[i]*0.15)*asp);
                text.setAttribute("font-size", text_font_size*asp);
                text.setAttribute("stroke", text_font_stroke);
                text.setAttribute("stroke-width", text_font_stroke_width*asp);
                text.textContent = divideHeader[i][j].value;

                svg.appendChild(text);
            }
        }
    }

    //body
    for(let i=0; i<body.length; i++){
        for(let j=0; j<body[j].length; j++){
            let text = document.createElementNS(theXmlns,"text");
            text.setAttribute("x", cellDataMatrix[i+divideHeader.length][j].x*asp);
            text.setAttribute("y", (cellDataMatrix[i+divideHeader.length][j].y - maxRowHeight[i+divideHeader.length]*0.15)*asp);
            text.setAttribute("font-size", text_font_size*asp);
            text.setAttribute("stroke", text_font_stroke);
            text.setAttribute("stroke-width", text_font_stroke_width*asp);
            text.textContent = body[i][j];

            svg.appendChild(text);
        }
    }
}

let _vtCreateAndAppendFrame = function(svg, setting, cellDataMatrix, asp, svg_size)
{
    let stroke_width = 1;
    if("stroke_width" in setting){
        stroke_width = setting.stroke_width;
    }

    let stroke = "black";
    if("stroke" in setting){
        stroke = setting.stroke;
    }

    let m_l = 0;
    if("text_margin_left" in setting){
        m_l = setting.text_margin_left;
    }
    let m_b = 0;
    if("text_margin_bottom" in setting){
        m_b = setting.text_margin_bottom;
    }

    //row dir line
    if(!("row_dir_line" in setting) || setting.row_dir_line){
        let line_u = document.createElementNS(theXmlns, "line");
        line_u.setAttribute("x1", 0);
        line_u.setAttribute("x2", svg_size.w*asp);
        line_u.setAttribute("y1", stroke_width/2*asp);
        line_u.setAttribute("y2", stroke_width/2*asp);
        line_u.setAttribute("stroke-width", stroke_width*asp);
        line_u.setAttribute("stroke", stroke);
        svg.appendChild(line_u);

        for(let i=0; i<cellDataMatrix.length-1; i++){
            let y = (cellDataMatrix[i][0].y + m_b + stroke_width/2)*asp;
            if(cellDataMatrix[i][0].row){
                let line = document.createElementNS(theXmlns, "line");
                line.setAttribute("x1", 0);
                line.setAttribute("x2", (cellDataMatrix[i][1].x - m_l)*asp);
                line.setAttribute("y1", y);
                line.setAttribute("y2", y);
                line.setAttribute("stroke-width", stroke_width*asp);
                line.setAttribute("stroke", stroke);
                svg.appendChild(line);
            }
            for(let j=1; j<cellDataMatrix[i].length-1; j++){
                if(cellDataMatrix[i][j].row){
                    let line = document.createElementNS(theXmlns, "line");
                    line.setAttribute("x1", (cellDataMatrix[i][j].x - m_l)*asp);
                    line.setAttribute("x2", (cellDataMatrix[i][j+1].x - m_l)*asp);
                    line.setAttribute("y1", y);
                    line.setAttribute("y2", y);
                    line.setAttribute("stroke-width", stroke_width*asp);
                    line.setAttribute("stroke", stroke);
                    svg.appendChild(line);
                }
            }
            let last = cellDataMatrix[i].length - 1;
            if(cellDataMatrix[i][last].row){
                let line = document.createElementNS(theXmlns, "line");
                line.setAttribute("x1", (cellDataMatrix[i][last].x - m_l)*asp);
                line.setAttribute("x2", svg_size.w*asp);
                line.setAttribute("y1", y);
                line.setAttribute("y2", y);
                line.setAttribute("stroke-width", stroke_width*asp);
                line.setAttribute("stroke", stroke);
                svg.appendChild(line);
            }
        }

        let line_b = document.createElementNS(theXmlns, "line");
        line_b.setAttribute("x1", 0);
        line_b.setAttribute("x2", svg_size.w*asp);
        line_b.setAttribute("y1", (svg_size.h - stroke_width/2)*asp);
        line_b.setAttribute("y2", (svg_size.h - stroke_width/2)*asp);
        line_b.setAttribute("stroke-width", stroke_width*asp);
        line_b.setAttribute("stroke", stroke);
        svg.appendChild(line_b);
    }

    //col dir line
    if(!("col_dir_line" in setting) || setting.col_dir_line){
        let line_l = document.createElementNS(theXmlns, "line");
        line_l.setAttribute("x1", stroke_width/2*asp);
        line_l.setAttribute("x2", stroke_width/2*asp);
        line_l.setAttribute("y1", 0);
        line_l.setAttribute("y2", svg_size.h*asp);
        line_l.setAttribute("stroke-width", stroke_width*asp);
        line_l.setAttribute("stroke", stroke);
        svg.appendChild(line_l);

        let line_r = document.createElementNS(theXmlns, "line");
        line_r.setAttribute("x1", (svg_size.w - stroke_width/2)*asp);
        line_r.setAttribute("x2", (svg_size.w - stroke_width/2)*asp);
        line_r.setAttribute("y1", 0);
        line_r.setAttribute("y2", svg_size.h*asp);
        line_r.setAttribute("stroke-width", stroke_width*asp);
        line_r.setAttribute("stroke", stroke);
        svg.appendChild(line_r);

        for(let i=0; i<cellDataMatrix.length; i++){
            for(let j=0; j<cellDataMatrix[i].length-1; j++){
                let x = (cellDataMatrix[i][j+1].x - m_l - stroke_width/2)*asp;
                if(cellDataMatrix[i][j].col){
                    if(i == 0){
                        let line = document.createElementNS(theXmlns, "line");
                        line.setAttribute("x1", x);
                        line.setAttribute("x2", x);
                        line.setAttribute("y1", 0);
                        line.setAttribute("y2", (cellDataMatrix[i][j].y + m_b)*asp);
                        line.setAttribute("stroke-width", stroke_width*asp);
                        line.setAttribute("stroke", stroke);
                        svg.appendChild(line);
                    }else if(i == cellDataMatrix.length-1){
                        let line = document.createElementNS(theXmlns, "line");
                        line.setAttribute("x1", x);
                        line.setAttribute("x2", x);
                        line.setAttribute("y1", (cellDataMatrix[i-1][j].y + m_b)*asp);
                        line.setAttribute("y2", svg_size.h*asp);
                        line.setAttribute("stroke-width", stroke_width*asp);
                        line.setAttribute("stroke", stroke);
                        svg.appendChild(line);
                    }else{
                        let line = document.createElementNS(theXmlns, "line");
                        line.setAttribute("x1", x);
                        line.setAttribute("x2", x);
                        line.setAttribute("y1", (cellDataMatrix[i-1][j].y + m_b)*asp);
                        line.setAttribute("y2", (cellDataMatrix[i][j].y + m_b)*asp);
                        line.setAttribute("stroke-width", stroke_width*asp);
                        line.setAttribute("stroke", stroke);
                        svg.appendChild(line);
                    }
                }
            }
        }
    }
}

let _vtCreateAndAppendHeaderFrame = function(svg, setting, cellDataMatrix, asp, svg_size, numHeaderRow)
{
    //row
    if(!("row_dir_line" in setting) || setting.row_dir_line){
        if("header_row" in setting){
            if(setting.header_row){
                let stroke_width = 3;
                if("header_stroke_width" in setting){
                    stroke_width = setting.header_stroke_width;
                }
                let stroke = "black";
                if("header_stroke" in setting){
                    stroke = setting.header_stroke;
                }
                let m_b = 0;
                if("text_margin_bottom" in setting){
                    m_b = setting.text_margin_bottom;
                }

                let line = document.createElementNS(theXmlns, "line");
                line.setAttribute("x1", 0);
                line.setAttribute("x2", svg_size.w*asp);
                line.setAttribute("y1", (cellDataMatrix[numHeaderRow-1][0].y + m_b + stroke_width/2)*asp);
                line.setAttribute("y2", (cellDataMatrix[numHeaderRow-1][0].y + m_b + stroke_width/2)*asp);
                line.setAttribute("stroke-width", stroke_width*asp);
                line.setAttribute("stroke", stroke);
                svg.appendChild(line);
            }
        }
    }

    //col
    if(!("col_dir_line" in setting) || setting.col_dir_line){
        if("header_col" in setting){
            if(setting.header_col){
                let stroke_width = 3;
                if("header_stroke_width" in setting){
                    stroke_width = setting.header_stroke_width;
                }
                let stroke = "black";
                if("header_stroke" in setting){
                    stroke = setting.header_stroke;
                }
                let m_l = 0;
                if("text_margin_left" in setting){
                    m_l = setting.text_margin_left;
                }

                let line = document.createElementNS(theXmlns, "line");
                line.setAttribute("x1", (cellDataMatrix[0][setting.header_col_pos].x - m_l - stroke_width/2)*asp);
                line.setAttribute("x2", (cellDataMatrix[0][setting.header_col_pos].x - m_l - stroke_width/2)*asp);
                line.setAttribute("y1", 0);
                line.setAttribute("y2", svg_size.h*asp);
                line.setAttribute("stroke-width", stroke_width*asp);
                line.setAttribute("stroke", stroke);
                svg.appendChild(line);
            }
        }
    }
}

let _vtCreateAndAppendOuterFrame = function(svg, setting, svg_size, asp)
{
    if("outer_frame" in setting){
        if(setting.outer_frame){
            outer_frame_stroke_width = 5;
            if("outer_frame_stroke_width" in setting){
                outer_frame_stroke_width = setting.outer_frame_stroke_width;
            }
            outer_frame_stroke = "black";
            if("outer_frame_stroke" in setting){
                outer_frame_stroke = setting.outer_frame_stroke;
            }
            if(!("row_dir_line" in setting) || setting.row_dir_line){
                let line_t = document.createElementNS(theXmlns, "line");
                line_t.setAttribute("x1", 0);
                line_t.setAttribute("x2", svg_size.w*asp);
                line_t.setAttribute("y1", outer_frame_stroke_width/2*asp);
                line_t.setAttribute("y2", outer_frame_stroke_width/2*asp);
                line_t.setAttribute("stroke-width", outer_frame_stroke_width*asp);
                line_t.setAttribute("stroke", outer_frame_stroke);
                svg.appendChild(line_t);

                let line_b = document.createElementNS(theXmlns, "line");
                line_b.setAttribute("x1", 0);
                line_b.setAttribute("x2", svg_size.w*asp);
                line_b.setAttribute("y1", (svg_size.h - outer_frame_stroke_width/2)*asp);
                line_b.setAttribute("y2", (svg_size.h - outer_frame_stroke_width/2)*asp);
                line_b.setAttribute("stroke-width", outer_frame_stroke_width*asp);
                line_b.setAttribute("stroke", outer_frame_stroke);
                svg.appendChild(line_b);
            }

            if(!("col_dir_line" in setting) || setting.col_dir_line){
                let line_l = document.createElementNS(theXmlns, "line");
                line_l.setAttribute("x1", outer_frame_stroke_width/2*asp);
                line_l.setAttribute("x2", outer_frame_stroke_width/2*asp);
                line_l.setAttribute("y1", 0);
                line_l.setAttribute("y2", svg_size.h*asp);
                line_l.setAttribute("stroke-width", outer_frame_stroke_width*asp);
                line_l.setAttribute("stroke", outer_frame_stroke);
                svg.appendChild(line_l);

                let line_r = document.createElementNS(theXmlns, "line");
                line_r.setAttribute("x1", (svg_size.w - outer_frame_stroke_width/2)*asp);
                line_r.setAttribute("x2", (svg_size.w - outer_frame_stroke_width/2)*asp);
                line_r.setAttribute("y1", 0);
                line_r.setAttribute("y2", svg_size.h*asp);
                line_r.setAttribute("stroke-width", outer_frame_stroke_width*asp);
                line_r.setAttribute("stroke", outer_frame_stroke);
                svg.appendChild(line_r);
            }
        }
    }
}

//add Vector Table to Elemja
function addVectorTable(setting, header, body)
{
    _vtCheckSetting(setting)//check setting
    let divideHeader = _vtDivideHeader(header);
    let cellMatrix = _vtGetTextWHList(setting, divideHeader, body);
    let maxColWidths, maxRowHeights;
    [maxColWidths, maxRowHeights] = _vtGetMaxWidthAndHeight(cellMatrix);
    _vtSetCharPos(setting, cellMatrix, maxColWidths, maxRowHeights, divideHeader.length);
    let svg_size = _vtCalSvgSize(setting, maxColWidths, maxRowHeights);
    let svg, asp;
    [svg, asp] = _vtCreateAndAppendSVG(setting, svg_size);
    let background = _vtCreateAndAppendBackground(svg, setting, svg_size, asp);
    _vtPutContents(svg, setting, divideHeader, body, cellMatrix, asp, maxRowHeights);
    _vtCreateAndAppendFrame(svg, setting, cellMatrix, asp, svg_size);
    _vtCreateAndAppendHeaderFrame(svg, setting, cellMatrix, asp, svg_size, divideHeader.length);
    _vtCreateAndAppendOuterFrame(svg, setting, svg_size, asp);
}