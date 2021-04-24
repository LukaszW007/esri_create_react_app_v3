import React, { Component } from "react";
import { loadCss, loadModules } from "esri-loader";
import { esriCSS, esriOptions } from "./config";
import "./App.css";
import RadioButton from "./components/RadioButton";

loadCss(esriCSS);

export default class App extends Component {
  constructor(props) {
    super(props);

    this.switchHandler = this.switchHandler.bind(this);

    this.state = {
      viewType: "SceneView",
    };
  }

  viewLoad() {
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/views/SceneView",
        "esri/Basemap",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/widgets/LayerList",
        "esri/request",
        "esri/Graphic",
      ],
      esriOptions
    )
      .then(
        ([
          Map,
          MapView,
          SceneView,
          Basemap,
          TileLayer,
          FeatureLayer,
          LayerList,
          request,
          Graphic,
        ]) => {
          const satelliteLayer = new TileLayer({
            url:
              "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            title: "satellite",
          });

          const fireflyLayer = new TileLayer({
            url:
              "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/HalfEarthFirefly/MapServer",
            title: "half-earth-firefly",
          });

          const basemap = new Basemap({
            baseLayers: [satelliteLayer, fireflyLayer],
            title: "half-earth-basemap",
            id: "half-earth-basemap",
          });

          const rangelands = new TileLayer({
            url:
              "https://tiles.arcgis.com/tiles/IkktFdUAcY3WrH25/arcgis/rest/services/gHM_Rangeland_inverted/MapServer",
          });

          const protectedFeatureLayer = new FeatureLayer({
            url:
              "https://services5.arcgis.com/Mj0hjvkNtV7NRhA7/arcgis/rest/services/WDPA_v0/FeatureServer/1",
          });

          const map = new Map({
            basemap: basemap,
            layers: [protectedFeatureLayer, rangelands],
          });
          
          const viewParameters = {
            map: map,
            container: "sceneContainer",
            environment: {
              atmosphereEnabled: false,
              background: {
                type: "color",
                color: [0, 10, 16],
              },
            },
            ui: {
              components: ["zoom"],
            },
          };

          let view = "";
          if (this.state.viewType === "SceneView") {
            view = new SceneView(viewParameters);
            console.log(`Rendering view as a SceneView and viewType in state is ${this.state.viewType}`);
          } else {
            view = new MapView(viewParameters);
            console.log(`Rendering view as a MapView and viewType in state is ${this.state.viewType}`);
          }

          const layerList = new LayerList({
            view: view,
          });

          view.ui.add(layerList, {
            position: "top-right",
          });

          const uploadForm = document.getElementById("uploadForm");

          uploadForm.addEventListener("change", function (event) {
            const filePath = event.target.value.toLowerCase();
            //only accept .zip files
            if (filePath.indexOf(".zip") !== -1) {
              generateFeatureCollection(uploadForm);
            }
          });

          function generateFeatureCollection(uploadFormNode) {
            const generateRequestParams = {
              filetype: "shapefile",
              publishParameters: JSON.stringify({
                targetSR: view.spatialReference,
              }),
              f: "json",
            };

            request(
              "https://www.arcgis.com/sharing/rest/content/features/generate",
              {
                query: generateRequestParams,
                body: uploadFormNode,
                responseType: "json",
              }
            ).then(function (response) {
              addShapefileToMap(response.data.featureCollection);
              console.log(
                "Response from the server: " + JSON.stringify(response)
              );
            });
          }

          function createFeaturesGraphics(layer) {
            console.log(layer);
            return layer.featureSet.features.map(function (feature) {
              return Graphic.fromJSON(feature);
            });
          }

          function createFeatureLayerFromGraphic(graphics) {
            return new FeatureLayer({
              objectIdField: "FID",
              source: graphics,
              title: "User uploaded shapefile",
            });
          }

          function addShapefileToMap(featureCollection) {
            let sourceGraphics = [];
            const collectionLayers = featureCollection.layers;
            const mapLayers = collectionLayers.map(function (layer) {
              const graphics = createFeaturesGraphics(layer);
              sourceGraphics = sourceGraphics.concat(graphics);
              const featureLayer = createFeatureLayerFromGraphic(graphics);
              return featureLayer;
            });
            map.addMany(mapLayers);
            view.goTo({ target: sourceGraphics, tilt: 40 });
          }
        }
      )
      .catch((err) => {
        console.error(err);
      });
  };

  switchHandler(view) {
    if (view === true) {
      this.setState({ viewType: "SceneView" });
    }
    if (view === false) {
      this.setState({ viewType: "MapView" });
    }
    console.log(`view in switchHandler: ${view} and viewType is ${this.state.viewType}`);
  }

  componentDidMount = () => {
    this.viewLoad();
  }

  componentDidUpdate = () => {
    this.viewLoad();
  }

  render() {
  console.log(`viewType in render is ${this.state.viewType}`);
  
    return (
      <div className="App">
        <div className="App-header">
          <h1>Welcome to ESRI React App</h1>
        </div>
        <div id="sceneContainer"></div>
        <form enctype="multipart/form-data" method="post" id="uploadForm">
          <div className="field">
            <label className="file-upload">
              <span>
                <strong>Upload shapefile .zip</strong>
              </span>
              <input type="file" name="file" id="inFile" />
            </label>
          </div>
        </form>
        <RadioButton onSwitchHandler={this.switchHandler} />
      </div>
    );
  }
}
