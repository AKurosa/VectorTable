const theProjectName = "[vectorTable]"
const theXmlns = "http://www.w3.org/2000/svg";
let elements = new Array();

//Window Resize Event
function resizeWindow(event){
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

window.addEventListener('resize', resizeWindow);

//Append SVG Area to Elem
function appendSvgArea(id)
{
    //Get element by id
    let elem = document.getElementById(id);

    //If can not get element by id
    if(elem==null)
    {
        throw "Can not get element by id (" + arguments.callee.name + ") " + theProjectName;
    }

    //Get element's width and height
    let elemWidth = elem.getBoundingClientRect().width;
    let elemHeight = elem.getBoundingClientRect().height;
    let viewBoxText = "0 0 " + elemWidth + " " + elemHeight;
    
    let svg = document.createElementNS(theXmlns,"svg");
    svg.setAttribute("width", elemWidth);
    svg.setAttribute("height", elemHeight);
    svg.setAttribute("viewBox", viewBoxText);
    elem.appendChild(svg);

    elements.push(elem);
}

//add Vector Table to Elem
function addVectorTable(id)
{
    appendSvgArea(id)
}