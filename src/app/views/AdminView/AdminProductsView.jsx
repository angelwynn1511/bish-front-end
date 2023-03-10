import React, { useEffect, useState } from 'react'
import axios from 'axios';
import apiBackEnd from '../../api/backend/api.Backend';
import loadingSVG from '../../assets/images/loading-spin.svg'
import { ToastContainer, toast } from 'react-toastify';
import TableRow from './../../components/admin/TableRow';
import TableHeadSort from '../../components/admin/TableHeadSort';
import { URL_BACK_PRODUCTS, URL_BACK_CATEGORIES, URL_BACK_PROMOS, URL_BACK_DELETE_PRODUCT, URL_BACK_UPDATE_TREND_PRODUCT, URL_BACK_UPDATE_AVAILABLE_PRODUCT, URL_BACK_UPDATE_MULTIPLE_TREND_PRODUCT, URL_BACK_UPDATE_MULTIPLE_AVAILABLE_PRODUCT } from '../../constants/urls/urlBackEnd';
import FormUpdate from '../../components/admin/product/FormUpdate';
import FormCreate from '../../components/admin/product/FormCreate';
import {Helmet} from 'react-helmet-async'
import TitleContainer from '../../components/admin/TitleContainer';
// import s3 from "../../bucket_S3/aws";

const AdminProductsView = () => {

  // Style
  const labelHeader = 'truncate hover:text-clip'
  // State modal CREATE
  const [modalIsOpen, setIsOpen] = useState(false);
  // Contenu d'un ligne de la table (sans les keys, que les datas)
  const [rows, setRows] = useState([])
  // Formulaire UPDATE
  const [formUpdate, setFormUpdate] = useState([])
  // Formulaire CREATE
  const [formCreate, setFormCreate] = useState()
  // SVG isLoading si requête en cours
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);
  // Reload table
  const [reload, setReload] = useState(false);

  const [rowsCheck, setRowsCheck] = useState([])
  const [allProductsId, setAllProductsId] = useState([])

  useEffect(() => {
    setIsLoadingCheck(false)
    // Permet d'afficher le SVG de chargement
    setIsLoading(true)
    // Récupération des données
    axios.all([
      apiBackEnd.get(URL_BACK_CATEGORIES),
      apiBackEnd.get(URL_BACK_PROMOS),
      apiBackEnd.get(URL_BACK_PRODUCTS)
    ])
    .then(respArr => {
      setRows([])
      setFormUpdate([])
      setRowsCheck([])
      setAllProductsId([])
      respArr[2].data.map(res => setAllProductsId(current => [...current, res.id]))
      // Set le contenu d'une row (à mettre dans l'ordre voulu)
      respArr[2].data.map((res, index) => setRows(current => [...current, [
        <input type="checkbox" id={`checkRow${res.id}`} onClick={() => toggleRowCheck(res.id)}/>,
        res.id,
        res.name,
        res.price.toFixed(2) + ' €',
        res.description,
        res.noteAverage ? res.noteAverage.toFixed(1) + '/5' : '-',
        res.stockBySize.reduce((accumulator, currentValue) => accumulator + currentValue.stock, 0),
        res.name_categorie,
        res.promotion.remise > 0 ? res.promotion.remise + ' %' : '-',
        res.created_at.date,
        <img className='object-contain h-10 m-auto hover:absolute hover:scale-[10.0] hover:z-50'  src={window.location.origin + '/src/app/assets/images/products/' + res.pathImage} /*src={s3.getSignedUrl('getObject', {Bucket: 'awsbish', Key: 'assets/images/products/'+ res.pathImage})}*/ alt={res.name}/>,
        <input className='h-8 w-8 lg:h-10 lg:w-10 bish-text-blue' type="checkbox" checked={res.is_trend} id={`checkTrend${res.id}`} onChange={() => changeIsTrend(res, respArr[0], respArr[1], index)}/>,
        <input className='h-8 w-8 lg:h-10 lg:w-10 bish-text-blue' type="checkbox" checked={res.is_available} id={`checkAvailable${res.id}`} onChange={() => changeIsAvailable(res, respArr[0], respArr[1], index)}/>
      ]]))

      respArr[2].data.map((res, index) => {
        // Formulaire UPDATE
        setFormUpdate(current => [...current,
          <FormUpdate produit={res} categories={respArr[0]} promotions={respArr[1]} index={index} updateTable={updateTable}/>
        ])
      })
      
      // Formulaire CREATE
      setFormCreate(
        <FormCreate categories={respArr[0]} promotions={respArr[1]} reload={reload} setReload={setReload} close={closeModal}/>
      )

      // Fin du chargement
      setIsLoading(false)
    })
  },[reload])

  const toggleRowCheck = id => {
    const isCheck = document.getElementById('checkRow' + id).checked
    if (isCheck) {
      setRowsCheck(current => [...current, id])
    } else {
      setRowsCheck(current => [...current.filter(res => res !== id)])
    }
  }

  const toggleAllRowsCheck = () => {
    const isCheck = document.getElementById('allRowsCheck').checked
    if (isCheck) {
      setRowsCheck(allProductsId)
    } else {
      setRowsCheck([])
    }
    document.querySelectorAll('table [id^="checkRow"]').forEach(checkbox => {
      checkbox.checked = isCheck;
    })
  }

  // Update le formulaire et la row update
  const updateTable = (produit, produitAfter, categs, promos, index, pathImageDefault) => {
    produit.name = produitAfter.name
    produit.description = produitAfter.description
    produit.pathImage = produitAfter.infoFile !== undefined ? produitAfter.infoFile.name : pathImageDefault
    produit.id_categorie = produitAfter.categorie
    produit.name_categorie = categs.data.find(element => element.id == produitAfter.categorie).name
    produit.is_trend = produitAfter.trend
    produit.is_available = produitAfter.available
    produit.price = produitAfter.price
    produit.promotion.id = produitAfter.promotion
    produit.promotion.remise = produitAfter.promotion !== '-' ? promos.data.find(element => element.id == produitAfter.promotion).remise : '-'
    produit.stockBySize[0].stock = produitAfter.stock.xs
    produit.stockBySize[1].stock = produitAfter.stock.s
    produit.stockBySize[2].stock = produitAfter.stock.m
    produit.stockBySize[3].stock = produitAfter.stock.l
    produit.stockBySize[4].stock = produitAfter.stock.xl
    // Modifier le modal update de la row concernée
    setFormUpdate(current => [
      ...current.slice(0, index),
      <FormUpdate produit={produit} categories={categs} promotions={promos} index={index} updateTable={updateTable}/>,
      ...current.slice(index+1)
    ])
    // Modifier la row concernée par l'update
    setRows(current => [
      ...current.slice(0, index),
      [
        <input type="checkbox" id={`checkRow${produit.id}`} onClick={() => toggleRowCheck(produit.id)}/>,
        produit.id,
        produit.name,
        produit.price.toFixed(2) + ' €',
        produit.description,
        produit.noteAverage ? produit.noteAverage.toFixed(1) + '/5' : '-',
        produit.stockBySize.reduce((accumulator, currentValue) => accumulator + currentValue.stock, 0),
        produit.name_categorie, 
        produit.promotion.remise > 0 ? produit.promotion.remise + ' %' : '-',
        produit.created_at.date,
        <img className='object-contain h-10 m-auto hover:absolute hover:scale-[10.0] hover:z-50' src={window.location.origin + '/src/app/assets/images/products/' + produit.pathImage} /*src={s3.getSignedUrl('getObject', {Bucket: 'awsbish', Key: 'assets/images/products/'+ produit.pathImage})}*/ alt={produit.name}/>,
        <input className='h-8 w-8 lg:h-10 lg:w-10 bish-text-blue' type="checkbox" checked={produit.is_trend} id={`checkTrend${produit.id}`} onChange={() => changeIsTrend(produit, categs, promos, index)}/>,
        <input className='h-8 w-8 lg:h-10 lg:w-10 bish-text-blue' type="checkbox" checked={produit.is_available} id={`checkAvailable${produit.id}`} onChange={() => changeIsAvailable(produit, categs, promos, index)}/>
      ],
      ...current.slice(index+1)
    ])
  }

  // Change tendance dans la BDD
  const changeIsTrend = (produit, categs, promos, index) => {
    let isTrend = document.getElementById('checkTrend' + produit.id).checked
    apiBackEnd.post(`${URL_BACK_UPDATE_TREND_PRODUCT}${produit.id}/${isTrend}/`).then(res => {
      document.getElementById('checkTrend' + produit.id).checked = isTrend
      produit.is_trend = !produit.is_trend
      // Modifier la checkbox "tendance" du FormUpdate
      setFormUpdate(current => [
        ...current.slice(0, index),
        <FormUpdate produit={produit} categories={categs} promotions={promos} index={index} updateTable={updateTable}/>,
        ...current.slice(index+1)
      ])
      if (isTrend) {
        toast.success(`Produit ${res.data.id} est en tendance !`, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" })
      } else {
        toast.success(`Produit ${res.data.id} n'est plus en tendance !`, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" })
      }
    })
  }

  const changeMultipleTrend = p => {
    setIsLoadingCheck(true)
    apiBackEnd.post(`${URL_BACK_UPDATE_MULTIPLE_TREND_PRODUCT}${p}/`, rowsCheck).then(res => {
      setRowsCheck([])
      setReload(!reload)
    })
  }

  // Change available dans la BDD
  const changeIsAvailable = (produit, categs, promos, index) => {
    let isAvailable = document.getElementById('checkAvailable' + produit.id).checked
    apiBackEnd.post(`${URL_BACK_UPDATE_AVAILABLE_PRODUCT}${produit.id}/${isAvailable}/`).then(res => {
      document.getElementById('checkAvailable' + produit.id).checked = isAvailable
      produit.is_available = !produit.is_available
      // Modifier la checkbox "visible" du FormUpdate
      setFormUpdate(current => [
        ...current.slice(0, index),
        <FormUpdate produit={produit} categories={categs} promotions={promos} index={index} updateTable={updateTable}/>,
        ...current.slice(index+1)
      ])
      if (isAvailable) {
        toast.success(`Produit ${res.data.id} est visible!`, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" })
      } else {
        toast.success(`Produit ${res.data.id} n'est plus visible !`, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" })
      }
    })
  }

  const changeMultipleAvailable = p => {
    setIsLoadingCheck(true)
    apiBackEnd.post(`${URL_BACK_UPDATE_MULTIPLE_AVAILABLE_PRODUCT}${p}/`, rowsCheck).then(res => {
      setRowsCheck([])
      setReload(!reload)
    })
  }

  // DELETE élément dans la BDD
  const deleteRow = id => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le produit ${id} ?`)) {
      apiBackEnd.delete(URL_BACK_DELETE_PRODUCT + id).then(res => {
        if (res.status === 200) {
          // Supprimer l'elément delete de la table
          setRows(rows.filter(res => res[1] !== id))
          setAllProductsId(allProductsId.filter(res => res !== id))
          setRowsCheck(rowsCheck.filter(res => res !== id))
          document.querySelectorAll('table [id^="checkRow"]').forEach(checkbox => {
            checkbox.checked = false;
          })
          rowsCheck.map(rowId => rowId !== id && (document.getElementById('checkRow' + rowId).checked = true))
          // Notification produit supprimé
          toast.success(`Produit ${id} supprimé!`, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" })
        }
      }).catch(error => {
        if(error.response.data.errorCode === '018') {
          // Notification produit en cours de commande
          toast.warn(error.response.data.errorMessage, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "light" });
        }
      })
    }
  }

  // Open modal CREATE
  function openModal() {
    setIsOpen(true);
  }

  // Close modal CREATE
  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className='w-full ml-12 sm:ml-64'>
      <Helmet>
        <title>Bish - Admin Commandes</title>
      </Helmet>
      {/* Notifications */}
      <ToastContainer />
      {/* TITRE + BUTTON AJOUTER */}
      <TitleContainer form={formCreate} name="PRODUITS" modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} addButton={true} />
      {/* Lignes selectionnées change tendance et visible */}
      {
        rowsCheck.length > 0 &&
        <div className='flex flex-row border-t-2 bish-border-gray fixed bottom-0 right-0 mt-20 bish-bg-white w-full z-10 py-5'>
          <div className='w-12 sm:w-72'></div>
          <span className='my-auto mr-10'>{rowsCheck.length} produits selectionnés</span>
          <button className='p-2 shadow border bish-border-gray mr-2' onClick={() => changeMultipleTrend(true)}>Mettre en tendance</button>
          <button className='p-2 shadow border bish-border-gray mr-10' onClick={() => changeMultipleTrend(false)}>Enlever des tendances</button>
          <button className='p-2 shadow border bish-border-gray mr-2' onClick={() => changeMultipleAvailable(true)}>Visible sur le site</button>
          <button className='p-2 shadow border bish-border-gray mr-10' onClick={() => changeMultipleAvailable(false)}>Retirer du site</button>
          {isLoadingCheck && (<img className='h-10' src={loadingSVG} alt="Chargement"></img>)}
        </div>
      }
      {/* TABLE PRODUITS */}
      {isLoading ? (<img className='absolute top-1/3 left-1/2' src={loadingSVG} alt="Chargement"></img>)
        : 
        (
          <table className="table-fixed w-full pl-5 mt-20" id="searchTable">
            {/* Nom de chaque colonne */}
            <thead className='border-b-4 bish-border-gray sticky top-40 bish-bg-white shadow z-[1]'>
              <tr>
                {/* Tous les titres dans le header de la table */}
                <th className={labelHeader}><input type="checkbox" id="allRowsCheck" onChange={() => toggleAllRowsCheck()}/></th>
                <TableHeadSort nbSortColumn="0" name="Id" />
                <TableHeadSort nbSortColumn="1" name="Nom" />
                <TableHeadSort nbSortColumn="2" name="Prix" />
                <TableHeadSort nbSortColumn="3" name="Description" />
                <TableHeadSort nbSortColumn="4" name="Note" />
                <TableHeadSort nbSortColumn="5" name="Stock" />
                <TableHeadSort nbSortColumn="6" name="Catégorie" />
                <TableHeadSort nbSortColumn="7" name="Promotion" />
                <TableHeadSort nbSortColumn="8" name="Date" />
                <th className={labelHeader} title='Tendance'>Image</th>
                <th className={labelHeader} title='Tendance'>Tendance</th>
                <th className={labelHeader} title='Visible'>Visible</th>
                {/* TH Actions à ne pas supprimer */}
                <th className={labelHeader} colSpan='2' title='Actions'>Actions</th>
              </tr>
            </thead>
            {/* Contenu de la table */}
            <tbody>
              {/* Retourne une ligne pour chaque élément */}
              {rows && rows.map((res, index) => <TableRow key={index} element={res} formUpdate={formUpdate[index]} deleteRow={deleteRow} withCheckRows={true}/>)}
            </tbody>
          </table>
        )
      }
    </div>
  )
}

export default AdminProductsView
