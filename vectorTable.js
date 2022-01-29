const theProjectName = "[vectorTable]"
const theXmlns = "http://www.w3.org/2000/svg";
let elements = new Array(); 

const class_vtTable = "_vtTable";
const class_backGround = "_vtBackGround";
const class_outerFrame = "_vtOuterFrame";

const key_backGroundColor = "background_color";

const at_rowLineWidth = "a_rlw";
const at_colLineWidth = "a_clw";

const zoom_delta = 1.1;

//Window Resize Event
function _vtResizeWindow(event){
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
function _vtWheel(event)
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

//check setting
function _vtCheckSetting(setting)
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

//Generate background
function _vtGenBackGround(setting, w, h)
{
    let background = document.createElementNS(theXmlns,"rect")
    background.setAttribute("x", 0);
    background.setAttribute("y", 0);
    background.setAttribute("width", w);
    background.setAttribute("height", h);
    if(key_backGroundColor in setting){
        background.setAttribute("fill", setting.background_color)
    }else{
        background.setAttribute("fill", "white");
    }
    background.classList.add(class_backGround)

    return background
}

//Generate outer frame
function _vtGenOuterFrame(setting, w, h)
{
    if(!("outer_frame" in setting)){
        return false;//if no key
    }else{
        if(!setting.outer_frame){
            return null//if value is false
        }
    }

    let g = document.createElementNS(theXmlns,"g");
    g.classList.add(class_outerFrame);

    let stroke_width = 5*2;
    if("outer_frame_stroke_width" in setting){
        stroke_width = setting.outer_frame_stroke_width;
    }

    //Row Line
    if("row_dir_line" in setting){
        if(setting.row_dir_line){//if drow row line
            //upper side line
            let uLine = document.createElementNS(theXmlns,"line");
            uLine.setAttribute("x1", 0);
            uLine.setAttribute("x2", w);
            uLine.setAttribute("y1", 0);
            uLine.setAttribute("y2", 0);
            uLine.setAttribute("stroke-width", stroke_width*2);
            if("outer_frame_stroke" in setting){
                uLine.setAttribute("stroke", setting.outer_frame_stroke);
            }
            g.appendChild(uLine);

            //lower side line
            let dLine = document.createElementNS(theXmlns, "line");
            dLine.setAttribute("x1", 0);
            dLine.setAttribute("x2", w);
            dLine.setAttribute("y1", h);
            dLine.setAttribute("y2", h);
            dLine.setAttribute("stroke-width", stroke_width*2);
            if("outer_frame_stroke" in setting){
                dLine.setAttribute("stroke", setting.outer_frame_stroke);
            }
            g.appendChild(dLine);

            g.setAttribute(at_rowLineWidth, stroke_width)
        }else{//if not drow row line
            g.setAttribute(at_rowLineWidth, 0);
        }
    }else{
        g.setAttribute(at_rowLineWidth, 0);
    }

    //Col Line
    if("col_dir_line" in setting){
        if(setting.col_dir_line){
            //Left side line
            let lLine = document.createElementNS(theXmlns,"line");
            lLine.setAttribute("x1", 0);
            lLine.setAttribute("x2", 0);
            lLine.setAttribute("y1", 0);
            lLine.setAttribute("y2", h);
            lLine.setAttribute("stroke-width", stroke_width*2);
            if("outer_frame_stroke" in setting){
                lLine.setAttribute("stroke", setting.outer_frame_stroke);
            }
            g.appendChild(lLine);

            //Right side line
            let rLine = document.createElementNS(theXmlns, "line");
            rLine.setAttribute("x1", w);
            rLine.setAttribute("x2", w);
            rLine.setAttribute("y1", 0);
            rLine.setAttribute("y2", h);
            rLine.setAttribute("stroke-width", stroke_width*2);
            if("outer_frame_stroke" in setting){
                rLine.setAttribute("stroke", setting.outer_frame_stroke);
            }
            g.appendChild(rLine);

            g.setAttribute(at_colLineWidth, stroke_width);
        }else{
            g.setAttribute(at_colLineWidth, 0);
        }
    }else{
        g.setAttribute(at_colLineWidth, 0);
    }

    return g;
}

//Append SVG Area to Elem
function _vtAppendSvgArea(setting)
{
    //Get element by id
    let elem = document.getElementById(setting.id);

    //Get element's width and height
    let elemWidth = elem.getBoundingClientRect().width;
    let elemHeight = elem.getBoundingClientRect().height;
    let viewBoxText = "0 0 " + elemWidth + " " + elemHeight;
    
    //Append svg
    let svg = document.createElementNS(theXmlns,"svg");
    svg.setAttribute("width", elemWidth);
    svg.setAttribute("height", elemHeight);
    svg.setAttribute("viewBox", viewBoxText);

    //Append background
    let bg = _vtGenBackGround(setting, elemWidth, elemHeight);
    svg.appendChild(bg);

    //Gen outer frame
    let of = _vtGenOuterFrame(setting, elemWidth, elemHeight);
    if(of != null){
        //svg.insertBefore(of, bg);
        svg.appendChild(of)
    }

    //Demo Line
    for(let i=30; i<elemWidth; i+=30){
        var demo_line = document.createElementNS(theXmlns,"line");
        demo_line.setAttribute("x1", i);
        demo_line.setAttribute("x2", i);
        demo_line.setAttribute("y1", 0);
        demo_line.setAttribute("y2", elemHeight);
        demo_line.setAttribute("stroke-width",1);
        demo_line.setAttribute("stroke","black");
        svg.appendChild(demo_line);
    }

    for(let i=30; i<elemHeight; i+=30){
        var demo_line = document.createElementNS(theXmlns,"line");
        demo_line.setAttribute("x1", 0);
        demo_line.setAttribute("x2", elemWidth);
        demo_line.setAttribute("y1", i);
        demo_line.setAttribute("y2", i);
        demo_line.setAttribute("stroke-width",1);
        demo_line.setAttribute("stroke","black");
        svg.appendChild(demo_line);
    }

    svg.classList.add(class_vtTable);
    elem.appendChild(svg);

    elem.addEventListener('wheel', _vtWheel);

    //Push to Global element array
    elements.push(elem);
}

//add Vector Table to Elem
function addVectorTable(setting)
{
    _vtCheckSetting(setting)//check setting
    _vtAppendSvgArea(setting)//Append SVG Area to Elem
}