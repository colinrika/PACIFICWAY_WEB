import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Items(){
  const [rows,setRows]=useState([])
  const [error,setError]=useState('')
  const { user } = useAuth()

  useEffect(()=>{
    api('/items')
      .then(d=>{
        const list=Array.isArray(d)?d:d.items||d.data?.items||d.data||[]
        const normalized=list.map((it,i)=>({
          id:it.id??it.item_id??it.uuid??`item-${i}`,
          name:it.name??it.item_name??it.title??'Untitled',
          price:Number(
            it.price??(typeof it.price_cents==='number'?it.price_cents/100:it.unit_price)
          )||0,
          stock:it.stock??it.quantity??it.stock_quantity??0,
          providerName:it.provider_name??it.provider?.name??it.providerName??'',
          providerId:it.provider_id??it.provider?.id??it.providerId??''
        }))
        setRows(normalized)
      })
      .catch(e=>setError(e.message))
  },[])

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <h2 style={{flex:1}}>Items</h2>
        {user && <Link to="/items/new" className="badge">+ New item</Link>}
      </div>
      {error && <div className="alert">{error}</div>}
      <table className="table">
        <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Provider</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>${Number(r.price).toFixed(2)}</td>
              <td>{r.stock}</td>
              <td>{r.providerName||r.providerId?.slice(0,8)||'-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="muted">No items yet.</div>}
    </div>
  )
}
