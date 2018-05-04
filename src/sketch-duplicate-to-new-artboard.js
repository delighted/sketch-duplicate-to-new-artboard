// Duplicate to new artboard
//
// Sketch plugin to duplicate the current selection(s) to new artboard(s).
//
// Copyright (c) 2018 Mike Gowen, Delighted.

const sketch = require("sketch");
const NEW_ARTBOARD_OFFSET = 50;

// Run handlers

export default function(context) {
  let document = sketch.fromNative(context.document);
  let page = document.selectedPage;
  let selectedLayers = document.selectedLayers;

  if (validSelection(selectedLayers)) {
    selectedLayers.forEach(layer => {
      let newArtboard = newArtboardFromLayerInPage(layer, page);
      duplicateLayerToArtboard(layer, newArtboard);
      positionArtboardInPage(newArtboard, page);
    });
  } else {
    sketch.UI.message("Please select a valid layer.");
  }
}

// Functions

function validSelection(selectedLayers) {
  return selectedLayers.length > 0 && !artboardSelected(selectedLayers);
}

function artboardSelected(selectedLayers) {
  return selectedLayers.reduce((artboardCount, layer) => {
    return artboardCount + layer.type === String(sketch.Types.Artboard);
  });
}

function newArtboardFromLayerInPage(layer, page) {
  let newArtboard = new sketch.Artboard({
    name: layer.name,
    parent: page
  });
  return newArtboard;
}

function rightmostLayerInPage(page) {
  return page.layers.reduce((rightMostLayer, layer) => {
    let rightMostLayerX = rightMostLayer.frame.x + rightMostLayer.frame.width;
    let layerX = layer.frame.x + layer.frame.width;
    return layerX >= rightMostLayerX ? layer : rightMostLayer;
  });
}

function topmostLayerInPage(page) {
  return page.layers.reduce((topmostLayer, layer) => {
    return layer.frame.y <= topmostLayer.frame.y ? layer : topmostLayer;
  });
}

function duplicateLayerToArtboard(layer, artboard) {
  let layerCopy = layer.duplicate();
  layerCopy.parent = artboard;
  artboard.adjustToFit();
}

function positionArtboardInPage(artboard, page) {
  let rightmostLayerInPageFrame = rightmostLayerInPage(page).frame;
  let newFrame = artboard.localRectToParentRect(artboard.frame);
  newFrame.x = rightmostLayerInPageFrame.x + rightmostLayerInPageFrame.width + NEW_ARTBOARD_OFFSET;
  newFrame.y = topmostLayerInPage(page).frame.y;
  artboard.frame = newFrame;
}
