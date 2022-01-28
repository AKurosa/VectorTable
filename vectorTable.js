const theProjectName = "[vectorTable]"
const theXmlns = "http://www.w3.org/2000/svg";
let elements = new Array();

//Window Resize Event
function _vtResizeWindow(event){
    elements.forEach(elem =>{
        let elemWidth = elem.getBoundingClientRect().width;
        let elemHeight = elem.getBoundingClientRect().height;
        let viewBoxText = "0 0 " + elemWidth + " " + elemHeight;

        let ef = elem.lastElementChild;
        ef.setAttribute("width", elemWidth );
        ef.setAttribute("height", elemHeight);
        ef.setAttribute("viewBox", viewBoxText);
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