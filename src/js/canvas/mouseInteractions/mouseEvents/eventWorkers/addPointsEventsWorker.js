import { removeEditedPolygonId } from './editPolygonEventsWorker';
import {
  removePolygonPoints, getPolygonEditingStatus, setEditablePolygon,
  getPolygonIdIfEditing, initializeAddNewPoints, addFirstPoint,
  addPoint, completePolygon, drawLineOnMouseMove, moveAddablePoint,
  addPointsMouseOver, resetAddPointProperties, addPointsMouseOut,
} from '../../../objects/polygon/alterPolygon/alterPolygon';
import { enableActiveObjectsAppearInFront, preventActiveObjectsAppearInFront } from '../../../utils/canvasUtils';
import { resetCanvasEventsToDefault } from '../resetCanvasUtils/resetCanvasEventsFacade';

let selectedPolygonId = null;
let newPolygonSelected = false;
let canvas = null;
let addingPoints = false;
let selectedNothing = false;
let addFirstPointMode = false;
let coordinatesOfLastMouseHover = null;

function isRightMouseButtonClicked(pointer) {
  if (coordinatesOfLastMouseHover.x !== pointer.x) {
    return true;
  }
  return false;
}

// highlight all of them differently to indicate that
// they can all be potentially edited (when none are selected)

// when polygon less than 3 points upon creation, the highlight should not light up
// along with the remove point tasks
// check if polyon remove initial point, resuming, then removing again still works ok
// check if when creating polygon, the hitting remove, the points should be behind active shape

// Make sure this is properly needed by doing tests
// when finished adding points, return to editable

// add is not a mode and should not light up

function mouseOverEvents(event) {
  addPointsMouseOver(event);
}

function setAddPointsEventsCanvas(canvasObj) {
  canvas = canvasObj;
  selectedPolygonId = getPolygonIdIfEditing();
  addingPoints = false;
  addFirstPointMode = false;
  resetAddPointProperties(canvasObj);
}

function prepareToAddPolygonPoints(event) {
  removePolygonPoints();
  removeEditedPolygonId();
  setEditablePolygon(canvas, event.target, false, false, true);
  selectedPolygonId = event.target.id;
  // should not be managed here
}

function moveAddPoints(event) {
  if (addingPoints) {
    moveAddablePoint(event);
  }
}

function mouseMove(event) {
  if (addingPoints) {
    const pointer = canvas.getPointer(event.e);
    coordinatesOfLastMouseHover = pointer;
    drawLineOnMouseMove(pointer);
  }
}

function pointMouseDownEvents(event) {
  if (!addingPoints) {
    if (event.target) {
      enableActiveObjectsAppearInFront(canvas);
      if (event.target.shapeName === 'point') {
        initializeAddNewPoints(event);
        addingPoints = true;
        addFirstPointMode = true;
      } else {
        if (event.target.shapeName === 'polygon') {
          newPolygonSelected = (event.target.id !== selectedPolygonId);
        }
        preventActiveObjectsAppearInFront(canvas);
      }
      selectedNothing = false;
    } else {
      selectedNothing = true;
    }
  } else if (addFirstPointMode) {
    if (!event.target || (event.target && (event.target.shapeName !== 'point' && event.target.shapeName !== 'initialAddPoint'))) {
      const pointer = canvas.getPointer(event.e);
      if (!isRightMouseButtonClicked(pointer)) {
        addFirstPoint(event);
        addFirstPointMode = false;
      }
    }
  } else if (event.target && event.target.shapeName === 'point') {
    addingPoints = false;
    completePolygon(event.target);
    resetCanvasEventsToDefault();
  } else if (!event.target
      || (event.target && (event.target.shapeName !== 'initialAddPoint' && event.target.shapeName !== 'tempPoint'))) {
    const pointer = canvas.getPointer(event.e);
    if (!isRightMouseButtonClicked(pointer)) {
      addPoint(pointer);
    }
  }
}

function pointMouseUpEvents(event) {
  if (event.target && event.target.shapeName === 'polygon' && (newPolygonSelected || selectedNothing)) {
    prepareToAddPolygonPoints(event);
    selectedNothing = false;
    newPolygonSelected = false;
  } else if ((!event.target && getPolygonEditingStatus()) || (event.target && event.target.shapeName === 'bndBox')) {
    if (!addingPoints) {
      removePolygonPoints();
      selectedPolygonId = null;
    }
  }
}

function mouseOutEvents(event) {
  addPointsMouseOut(event);
}

function getSelectedPolygonIdForAddPoints() {
  return selectedPolygonId;
}

export {
  mouseMove,
  moveAddPoints,
  mouseOutEvents,
  mouseOverEvents,
  pointMouseUpEvents,
  pointMouseDownEvents,
  setAddPointsEventsCanvas,
  getSelectedPolygonIdForAddPoints,
};
