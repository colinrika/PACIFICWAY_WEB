import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Items(){
  const [rows,setRows]=useState([])
  const [error,setError]=useState('')
  const { user } = useAuth()

  useEffect(()=>{
    api('/items').then(d=>setRows(d.items||[])).catch(e=>setError(e.message))
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
              <td>{r.provider_name||r.provider_id?.slice(0,8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="muted">No items yet.</div>}
    </div>
  )
}
