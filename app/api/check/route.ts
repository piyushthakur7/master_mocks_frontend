import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect('mongodb+srv://singh2231852_db_user:dVAFSZcfnpfFIYqn@cluster0.fhsdjgp.mongodb.net/?appName=Cluster0');
    }
    
    const db = mongoose.connection;
    const payments = await db.collection('payments').find({}).toArray();
    const purchases = await db.collection('purchases').find({}).toArray();
    
    return NextResponse.json({ payments, purchases });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
