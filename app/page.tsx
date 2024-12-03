'use client'

import Header from './components/Header'

import React from 'react';

import dotenv from "dotenv";

import Dashboard from './components/Dashboard'

dotenv.config({ path: '.env' })

export default function Home() {

  return (

    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  )
}