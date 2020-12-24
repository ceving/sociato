export {Movability};

/**
* Movability makes group elements of a SVG element movable.  Moving
* stops, if the mouse leaves the SVG container.  Moving is implemented
* by setting the values `e` and `f` of the SVG tranformation matrix of
* the SVG group:
*
*   ⎛a c e⎞
*   ⎜b d f⎟
*   ⎝0 0 1⎠
*
* The value `e` translates in x direction. The value `f` translates in
* y direction.
*
* @see https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix
*/
class Movability
{
  /**
   * Calculate the position of the event relative to the SVG
   * container.
   */
  position (event)
  {
    var ctm = this.svg.getScreenCTM ();
    return [(event.clientX - ctm.e) / ctm.a,
	    (event.clientY - ctm.f) / ctm.d];
  }

  /**
   * Callback for the event `mousedown`.  This function initializes
   * the `moving` element and its `x` and `y` position.
   */
  start (movable, event)
  {
    this.moving = movable;
    [this.x, this.y] = this.position (event);
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Callback for the events `mouseup` and `mouseleave`.  This
   * function resets the movement by unsetting the `moving` element
   * and its `x` and `y` position.
   */
  reset (event)
  {
    this.moving = null;  // The element, which is currently moving.
    this.x      = null;  // The x position of the moving element.
    this.y      = null;  // The y position of the moving element.
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  /**
   * Callback for the `mousemove` event.  This function calls the
   * `move` function, which as been mixed in by `add`.
   */
  move (event)
  {
    if (this.moving) {
      let [x, y] = this.position (event);
      let dx = x - this.x;
      let dy = y - this.y;
      this.moving.move (dx, dy);
      this.x = x;
      this.y = y;
      event.stopPropagation();
      event.preventDefault();
    }
  }

  /**
   * Adds movablity to `movable` by mixing a `move` function into
   * `movable` and addind a event listener to the `handle`, in order
   * to move the `movable`.  The handle can be ommitted, if the
   * `movable` is also the `handle`.  The `movable` must be a SVG
   * group element.  The `move` function sets the values `e` and `f`
   * of the SVG transform matrix of the SVG group element.
   */
  add (movable, handle)
  {
    if (!(movable instanceof SVGGElement))
      throw new TypeError ('Movable needs to be a SVG group.');
    if (!(movable.move === undefined))
      throw new Error ('Element seems to be movable already.');
    if (!handle)
      handle = movable;
    
    movable.move = function (x, y, relative=true)
    {
      var list = movable.transform.baseVal;
      list.consolidate ();
      var transform = list.createSVGTransformFromMatrix(list.getItem(0).matrix);
      if (relative) {
	transform.matrix.e += x;
	transform.matrix.f += y;
      } else {
	transform.matrix.e = x;
	transform.matrix.f = y;
      }
      list.replaceItem (transform, 0);
    }

    handle.addEventListener ('mousedown', (event) => this.start (movable, event));
  }

  /**
   * Create a `Movability` object.  Movement happens relative to a
   * `svg` element, which has to be specified.  The constructor adds
   * event handers for the events `mouseup`, `mouseleave` and
   * `mousemove` to the `svg` element.  In order to actually move
   * an element, it has be added to the Movablity object by calling
   * the `add` method.
   */
  constructor (svg)
  {
    if (!(svg instanceof SVGSVGElement))
      throw new TypeError ('Not a SVG element.');
    
    this.svg = svg;
    this.reset ();
    svg.addEventListener ('mouseup',    (event) => this.reset (event));
    svg.addEventListener ('mouseleave', (event) => this.reset (event));
    svg.addEventListener ('mousemove',  (event) => this.move (event));
  }
}
