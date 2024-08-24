import React, { useState, MouseEvent, useEffect } from "react";
import styles from "./CatalogSideMenu.module.css";
import { MdLayers, MdArrowBackIos } from "react-icons/md";
import DataContainer from "../DataContainer/DataContainer";
import { useCatalogContext } from "../../context/CatalogContext";
import MultipleLayersSetting from "../MultipleLayersSetting/MultipleLayersSetting";
import { useUIContext } from "../../context/UIContext";

function CatalogMenu() {
  const { openModal, setSidebarMode, } = useUIContext()

  const {
    setSelectedContainerType,
    resetState,
    setFormStage,
    setLegendList,
    geoPoints,
    setGeoPoints,
  } = useCatalogContext();

  useEffect(
    function () {

      setGeoPoints([]);
    },
    [setGeoPoints]
  );

  function openCatalogModal(contentType: "Catalogue" | "Layer") {
    setSelectedContainerType(contentType);
    openModal(<DataContainer />);
  }


  function handleAddCatalogClick(event: MouseEvent) {
    openCatalogModal("Catalogue");
  }

  function handleAddLayerClick(event: MouseEvent) {
    openCatalogModal("Layer");
  }

  function handleDiscardClick(event: MouseEvent) {
    resetState();
  }

  const safeGeoPoints = Array.isArray(geoPoints) ? geoPoints : [];

  function handleSaveClick() {
    const legends = safeGeoPoints
      .map(function (featureCollection) {
        return featureCollection.layer_legend;
      })
      .filter(function (legend): legend is string {
        return !!legend;
      });

    setLegendList(legends);
    setFormStage("catalogDetails");
    setSidebarMode("catalogDetails");
  }

  return (
    <div className="flex flex-col justify-between h-full w-full pr-1.5">

      <div className='flex flex-col justify-start mt-7 '>
        <div className='flex justify-between items-center mx-8 my-2'>
          <p className={'text-lg font-semibold'}>Datasets</p>
          <button
            className={'bg-[#115740] border border-white rounded h-16 w-36 text-white hover:bg-[#28a745] transition-all'}
            onClick={handleAddCatalogClick}
          >
            + Add Catalog
          </button>
        </div>
        <div className={'flex justify-between items-center mx-8 my-2'}>
          <p className={'text-lg font-semibold'}>Layers</p>
          <button
            className={'bg-white border-2 border-[#115740] rounded h-16 w-36 text-black hover:bg-gray-300 transition-all'}
            onClick={handleAddLayerClick}
          >
            + Add Layer
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full justify-start items-center overflow-y-auto overflow-x-hidden px-4">
        {safeGeoPoints.map(function (featureCollection, index) {
          return <MultipleLayersSetting key={index} layerIndex={index} />;
        })}
      </div>

      <div className="w-full flex-col h-[9%] flex  px-2 py-2 select-none border-t">
        <div className="flex h-full w-full space-x-2">
          <button
            disabled={!(safeGeoPoints.length > 0)}
            onClick={handleDiscardClick}
            className="w-full h-full bg-slate-100 border-2 border-[#115740] text-[#115740] flex justify-center items-center font-semibold rounded-lg
                 hover:bg-white transition-all cursor-pointer disabled:text-opacity-55 disabled:hover:bg-slate-100 disabled:cursor-not-allowed">
            Discard
          </button>

          <button
            onClick={handleSaveClick}
            disabled={!(safeGeoPoints.length > 0)}
            className="w-full h-full bg-[#115740] text-white flex justify-center items-center font-semibold rounded-lg hover:bg-[#123f30] 
            transition-all cursor-pointer disabled:text-opacity-55 disabled:hover:bg-[#115740] disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CatalogMenu;
