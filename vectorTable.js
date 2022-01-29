const theProjectName = "[vectorTable]"
const theXmlns = "http://www.w3.org/2000/svg";
let elements = new Array(); 

const class_backGround = "_vtBackGround";
const class_outerFrame = "_vtOuterFrame";

const key_backGroundColor = "background_color";

const at_rowLineWidth = "a_rlw";
const at_colLineWidth = "a_clw";

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

        //Back Ground
        let backgrounds = ef.getElementsByClassName(class_backGround);
        Array.from(backgrounds).forEach(b =>{
            b.setAttribute("width", elemWidth);
            b.setAttribute("height", elemHeight);
        });

        //Outer Line
        let outerFrame = ef.getElementsByClassName(class_outerFrame);
        Array.from(outerFrame).forEach(o =>{
            let children = o.children;
            Array.from(children).forEach(c =>{
                let old_x1 = Number(c.getAttribute("x1"));
                c.setAttribute("x1", old_x1 * elemWidth / old_width);

                let old_x2 = Number(c.getAttribute("x2"));
                c.setAttribute("x2", old_x2 * elemWidth / old_width);

                let old_y1 = Number(c.getAttribute("y1"));
                c.setAttribute("y1", old_y1 * elemHeight / old_height);

                let old_y2 = Number(c.getAttribute("y2"));
                c.setAttribute("y2", old_y2 * elemHeight / old_height);
            });
        });
    });
}

window.addEventListener('resize', _vtResizeWindow);

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

    elem.appendChild(svg);

    //Push to Global element array
    elements.push(elem);
}

//add Vector Table to Elem
function addVectorTable(setting)
{
    _vtCheckSetting(setting)//check setting
    _vtAppendSvgArea(setting)//Append SVG Area to Elem
}