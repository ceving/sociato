export {WfGraph, WfState, WfTask};

import {text, element, html, svg} from './dom-util.js';
import {camel2hyphen} from './string-util.js';
import {Movability} from './movability.js';


/**
* Workflow Graph
*/
class WfGraph extends HTMLElement
{
  center ()
  {
    this.group.move (this.svg.width.baseVal.value / 2,
		     this.svg.height.baseVal.value / 2,
		     false);
  }
  
  scale (factor, relative=true)
  {
    var list = this.container.transform.baseVal;
    list.consolidate();
    var transform = list.createSVGTransformFromMatrix(list.getItem(0).matrix);
    var scale = relative ? transform.matrix.a + factor : factor;
    if (scale < 0.2) scale = 0.2;
    transform.matrix.a = scale;
    transform.matrix.d = scale;
    this.container.transform.baseVal.initialize (transform);
  }

  zoom (direction)
  {
    direction = Math.sign (direction);
    if (direction != 0)
      this.scale (0.2 * direction);
  }

  constructor ()
  {
    // Create shadow root
    super().attachShadow ({mode: 'open'});
    
    // Read dataset attibutes
    if (!this.dataset.width)  this.dataset.width  = 400;
    if (!this.dataset.height) this.dataset.height = 300;

    // Create dom tree
    this.shadowRoot.appendChild (
      html ('link', {rel: 'stylesheet', href: 'wf-graph.css'}));
    this.shadowRoot.appendChild (
      html ('div', {display: 'grid'},
	    html ('div', {class: 'buttons', display: 'flex'},
		  html ('button', {id: 'zoom-in', type: 'button'}, text ('Zoom In')),
		  html ('button', {id: 'zoom-out', type: 'button'}, text ('Zoom Out')),
		  html ('button', {id: 'zoom-reset', type: 'button'}, text ('Zoom Reset')),
		  html ('button', {id: 'center', type: 'button'}, text ('Center')),
		  html ('span', {id: 'mouse-log'})),
	    svg ('svg', {class:  camel2hyphen (this.constructor.name),
			 width:  this.dataset.width,
			 height: this.dataset.height},
		 svg ('g', {transform: `matrix(1,0,0,1,${this.dataset.width/2},${this.dataset.height/2})`},
		     ))));

    // Store some elements
    this.buttons = [];
    this.buttons['zoom-in']    = this.shadowRoot.getElementById ('zoom-in');
    this.buttons['zoom-out']   = this.shadowRoot.getElementById ('zoom-out');
    this.buttons['zoom-reset'] = this.shadowRoot.getElementById ('zoom-reset');
    this.buttons['center']     = this.shadowRoot.getElementById ('center');
    this.svg   = this.shadowRoot.querySelector ('svg')
    this.group = this.shadowRoot.querySelector ('svg > g:first-child');

    // Mouse debug
    this.svg.addEventListener ('mousemove', ((log) => {return (event) => {
      log.innerText = `Screen: (${event.screenX}, ${event.screenY}) Client: (${event.clientX}, ${event.clientY})`;
    }})(this.shadowRoot.getElementById ('mouse-log')));

    // Initialize movablity
    this.movability = new Movability (this.svg);
    this.movability.add (this.group, this.svg);
    this.buttons.center.addEventListener ('click', (event) => this.center());

    // Define event listener for zooming
    this.svg.addEventListener ('wheel', (event) => this.zoom (-event.deltaY));
    this.buttons['zoom-in']   .addEventListener ('click', (event) => this.zoom (1));
    this.buttons['zoom-out']  .addEventListener ('click', (event) => this.zoom (-1));
    this.buttons['zoom-reset'].addEventListener ('click', (event) => this.scale (1, false));
  }
}

class WfElement extends HTMLElement
{
  constructor ()
  {
    super();
    this.group = svg ('g', {class: camel2hyphen (this.constructor.name),
			    transform: 'translate(0,0)'});
    this.dataset.selected = this.selected = false;
  }

  symbol () { throw new Error ('Abstract method.'); }
  
  connectedCallback ()
  {
    this.graph = this.closest ('wf-graph');
    if (!this.graph)
      throw new TypeError ('Enclosing wf-graph element is missing!');
    if (!this.id)
      throw new TypeError ('Child elements of wf-graph require an id!');
    this.graph.group.appendChild (this.group);
    this.symbol ();
    var label = svg ('text', {x: 0, y: 30, editable: 'simple'}, text (this.textContent));
    this.group.appendChild (label);
    var label_box = label.getBBox();
    var label_rect = svg ('rect', {class:  'text',
				   x:      -label_box.width/2 -1,
				   y:      label_box.y        -1,
				   width:  label_box.width    +2,
				   height: label_box.height   +2});
    this.group.insertBefore (label_rect, label);
    // Complicate calculation of the bounding box, because getBBox is
    // unreliable here.
    var group_rect = svg ('rect', {class: 'box',
				   x:      label_rect.x.baseVal.value             -1,
				   y:      -14                                    -1,
				   width:  label_rect.width.baseVal.value         +2,
				   height: label_rect.height.baseVal.value + 2*14 +2,
				   rx:     5,
				   ry:     5});
    this.group.insertBefore (group_rect, this.group.firstChild);

    // References
    this.handle = this.group.querySelector ('.handle');

    // Movability
    this.graph.movability.add (this.group);
    
    // Events
    this.handle.addEventListener ('dblclick', (event) => {
      this.selected = this.dataset.selected = this.handle.classList.toggle ('selected');
    });
  }
}

class WfState extends WfElement
{
  symbol ()
  {
    // Three circles, to avoid strokes, which cause a wrong bounding box.
    this.group.appendChild (svg ('circle', {class: 'margin', cx: 0, cy: 0, r: 14}));
    this.group.appendChild (svg ('circle', {class: 'border', cx: 0, cy: 0, r: 10}));
    this.group.appendChild (svg ('circle', {class: 'fill handle', cx: 0, cy: 0, r: 8}));
  }
}

class WfTask extends WfElement
{
  symbol ()
  {
    // Three rects, to avoid strokes, which cause a wrong bounding box.
    this.group.appendChild (svg ('rect', {class: 'margin', x: -14, y: -14, width: 28, height: 28}));
    this.group.appendChild (svg ('rect', {class: 'border', x: -10, y: -10, width: 20, height: 20}));
    this.group.appendChild (svg ('rect', {class: 'fill handle', x: -8, y: -8, width: 16, height: 16}));
  }
}
