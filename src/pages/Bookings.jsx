import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function normalizeServices(raw){
  const list=Array.isArray(raw)?raw:raw?.services||raw?.data?.services||raw?.data||[]
  return list.map((it,i)=>({
    id:it?.id??it?.service_id??it?.uuid??`service-${i}`,
    name:it?.name??it?.service_name??it?.title??'Untitled',
    price:Number(
      it?.price??(typeof it?.price_cents==='number'?it.price_cents/100:it?.rate)
    )||0
  }))
}

function normalizeBookings(raw){
  const list=Array.isArray(raw)?raw:raw?.bookings||raw?.data?.bookings||raw?.data||[]
  return list.map((it,i)=>({
    id:it?.id??it?.booking_id??`booking-${i}`,
    serviceName:it?.service_name??it?.service?.name??it?.serviceName??'',
    serviceId:it?.service_id??it?.service?.id??'',
    date:it?.date??it?.scheduled_at??it?.scheduled_for??it?.created_at??'',
    status:it?.status??it?.state??'unknown',
    notes:it?.notes??it?.note??''
  }))
}

export default function Bookings(){
  const{token}=useAuth()
  const[services,setServices]=useState([])
  const[rows,setRows]=useState([])
  const[serviceId,setServiceId]=useState('')
  const[date,setDate]=useState('')
  const[notes,setNotes]=useState('')
  const[error,setError]=useState('')

  useEffect(()=>{
    api('/services').then(d=>setServices(normalizeServices(d))).catch(()=>{})
    api('/bookings/me',{token})
      .then(d=>setRows(normalizeBookings(d)))
      .catch(e=>setError(e.message))
  },[token])

  const create=async e=>{
    e.preventDefault()
    try{
      setError('')
      await api('/bookings',{
        method:'POST',
        token,
        body:{service_id:serviceId,date,scheduled_at:date,notes}
      })
      const fresh=await api('/bookings/me',{token})
      setRows(normalizeBookings(fresh))
      setServiceId('')
      setDate('')
      setNotes('')
    }catch(err){
      setError(err.message)
    }
  }

  return(
    <div>
      <h2>My Bookings</h2>
      {error&&<div className='alert'>{error}</div>}
      <form onSubmit={create} className='row'>
        <div className='col'>
          <label>Service</label>
          <select value={serviceId} onChange={e=>setServiceId(e.target.value)}>
            <option value=''>Select service</option>
            {services.map(s=>(
              <option key={s.id} value={s.id}>
                {s.name} — ${Number(s.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className='col'>
          <label>Date/Time (UTC)</label>
          <input type='datetime-local' value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
        <div className='col'>
          <label>Notes</label>
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder='anything to add?'/>
        </div>
        <div className='col' style={{alignSelf:'end'}}>
          <button>Create Booking</button>
        </div>
      </form>
      <table className='table' style={{marginTop:16}}>
        <thead>
          <tr><th>Service</th><th>Date</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.serviceName||r.serviceId?.slice(0,8)||'-'}</td>
              <td>{r.date?new Date(r.date).toLocaleString():'-'}</td>
              <td><span className='badge'>{r.status}</span></td>
              <td>{r.notes||'-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length&&<div className='muted'>No bookings yet.</div>}
    </div>
  )
}
