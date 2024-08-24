import {
  CatalogContextType,
  MapFeatures,
  SaveResponse,
} from "../types/allTypesAndInterfaces";
import { HttpReq } from "../services/apiService";
import urls from "../urls.json";
import userIdData from "../currentUserId.json";
import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "../context/AuthContext"; // Add this import
import { useNavigate } from 'react-router-dom';

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);


export function CatalogProvider(props: { children: ReactNode }) {
  const { authResponse } = useAuth(); // Add this line
  const navigate = useNavigate();
  const { children } = props;

  const [formStage, setFormStage] = useState<'catalog' | 'catalogDetails' | 'save'>('catalog');
  const [saveMethod, setSaveMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [legendList, setLegendList] = useState<string[]>([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [selectedContainerType, setSelectedContainerType] = useState<
    "Catalogue" | "Layer" | "Home"
  >("Home");

  const [geoPoints, setGeoPoints] = useState<MapFeatures[]>([]);
  const [lastGeoIdRequest, setLastGeoIdRequest] = useState<
    string | undefined
  >();
  const [lastGeoMessageRequest, setLastGeoMessageRequest] = useState<
    string | undefined
  >();
  const [lastGeoError, setLastGeoError] = useState<Error | null>(null);

  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);

  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const [saveResponse, setSaveResponse] = useState<SaveResponse | null>(null);
  const [saveResponseMsg, setSaveResponseMsg] = useState("");
  const [saveReqId, setSaveReqId] = useState("");

  async function fetchGeoPoints(id: string, typeOfCard: string) {
    if (!authResponse || !('idToken' in authResponse)) {
      setIsError(new Error("User is not authenticated!"));
      navigate('/auth');
      return;
    }
    const apiJsonRequest =
      typeOfCard === "layer"
        ? {
          prdcer_lyr_id: id,
          user_id: userIdData.user_id,
        }
        : typeOfCard === "userCatalog"
          ? { prdcer_ctlg_id: id, as_layers: true, user_id: authResponse.localId }
          : { catalogue_dataset_id: id };

    const url =
      typeOfCard === "layer"
        ? urls.prdcer_lyr_map_data
        : typeOfCard === "userCatalog"
          ? urls.fetch_ctlg_lyrs
          : urls.http_catlog_data;

    let unprocessedData: MapFeatures | MapFeatures[] | null = null;

    const callData = function (data: MapFeatures | MapFeatures[]) {
      unprocessedData = data;
    };

    await HttpReq<MapFeatures | MapFeatures[]>(
      url,
      callData,
      setLastGeoMessageRequest,
      setLastGeoIdRequest,
      setIsLoading,
      setIsError,
      "post",
      apiJsonRequest,
      authResponse.idToken
    );

    if (isError) {
      console.error("An error occurred while fetching geo points.");
      return;
    }

    if (unprocessedData) {
      var updatedDataArray = (
        Array.isArray(unprocessedData) ? unprocessedData : [unprocessedData]
      ).map(function (layer) {
        return Object.assign({}, layer, { display: true });
      });

      setGeoPoints(function (prevGeoPoints) {
        return prevGeoPoints.concat(updatedDataArray);
      });
    }
  }

  function handleAddClick(
    id: string,
    name: string,
    typeOfCard: string,
    legend?: string,
    layers?: { layer_id: string; points_color: string }[]
  ) {
    fetchGeoPoints(id, typeOfCard);
  }

  function handleSaveLayer() {
    if (!authResponse || !('idToken' in authResponse)) {
      setIsError(new Error("User is not authenticated!"));
      navigate('/auth');
      return;
    }
    const layersData = Array.isArray(geoPoints)
      ? geoPoints.map((layer) => ({
        layer_id: layer.prdcer_lyr_id,
        points_color: layer.points_color,
      }))
      : [];

    const requestBody = {
      prdcer_ctlg_name: name,
      subscription_price: subscriptionPrice,
      ctlg_description: description,
      total_records: 0,
      lyrs: layersData,
      user_id: authResponse.localId,
      thumbnail_url: "",
    };

    HttpReq(
      urls.save_producer_catalog,
      setSaveResponse,
      setSaveResponseMsg,
      setSaveReqId,
      setIsLoading,
      setIsError,
      "post",
      requestBody,
      authResponse.idToken
    );

    setTimeout(() => {
      resetFormStage('catalog')
    }, 1000)
  }

  function resetFormStage(resetTo: 'catalog') {
    setDescription("");
    setName("");
    setSubscriptionPrice(" ");
    setSaveResponse(null);
    setIsError(null);
    setFormStage(resetTo);
  }

  function resetState() {
    setGeoPoints([]);
    setLastGeoIdRequest(undefined);
    setLastGeoMessageRequest(undefined);
    setLastGeoError(null);
  }

  function updateLayerColor(layerIndex: number | null, newColor: string) {
    setGeoPoints(function (prevGeoPoints) {
      var updatedGeoPoints = prevGeoPoints.map(function (geoPoint, index) {
        if (layerIndex === null || layerIndex === index) {
          return Object.assign({}, geoPoint, {
            points_color: newColor.toLowerCase(),
          });
        }
        return geoPoint;
      });
      return updatedGeoPoints;
    });
  }

  function updateLayerDisplay(layerIndex: number, display: boolean) {
    setGeoPoints(function (prevGeoPoints) {
      var updatedGeoPoints = prevGeoPoints.slice();
      updatedGeoPoints[layerIndex].display = display;
      return updatedGeoPoints;
    });
  }

  // function updateLayerZone(layerIndex: number, isZoneLayer: boolean) {
  //   setGeoPoints((prevGeoPoints) => {
  //     const updatedGeoPoints = [...prevGeoPoints];
  //     updatedGeoPoints[layerIndex].is_zone_lyr = isZoneLayer;
  //     return updatedGeoPoints;
  //   });
  // }

  function removeLayer(layerIndex: number) {
    setGeoPoints(function (prevGeoPoints) {
      var updatedGeoPoints = prevGeoPoints.filter(function (_, index) {
        return index !== layerIndex;
      });
      return updatedGeoPoints;
    });
  }
  return (
    <CatalogContext.Provider
      value={{
        formStage,
        saveMethod,
        isLoading,
        isError,
        legendList,
        subscriptionPrice,
        description,
        name,
        setFormStage,
        setSaveMethod,
        setIsLoading,
        setIsError,
        setLegendList,
        setSubscriptionPrice,
        setDescription,
        setName,
        handleAddClick,
        handleSaveLayer,
        resetFormStage,
        selectedContainerType,
        setSelectedContainerType,
        geoPoints,
        setGeoPoints,
        selectedColor,
        setSelectedColor,
        openDropdownIndex,
        setOpenDropdownIndex,
        resetState,
        saveResponse,
        saveResponseMsg,
        saveReqId,
        setSaveResponse,
        updateLayerColor,
        updateLayerDisplay,
        // updateLayerZone,
        removeLayer,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogContext() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalogContext must be used within a CatalogProvider");
  }
  return context;
}
