"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CartItem } from '@/context/CartContext';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  subheader: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 5,
    paddingTop: 5,
  },
  boldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingTop: 10,
    marginTop: 10,
  },
  text: {
    fontSize: 12,
  },
  boldText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

interface InvoicePDFProps {
  items: CartItem[];
  total: number;
  orderType: string;
  phone: string;
  date: string;
}

export const InvoicePDF = ({ items, total, orderType, phone, date }: InvoicePDFProps) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <Text style={styles.header}>QRAZY Invoice</Text>
      <Text style={styles.subheader}>Date: {date}</Text>
      <Text style={styles.subheader}>Type: {orderType} | Phone: {phone}</Text>

      <View style={{ marginBottom: 20 }}>
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.text}>{item.quantity}x {item.name}</Text>
            <Text style={styles.text}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.boldRow}>
        <Text style={styles.boldText}>Total</Text>
        <Text style={styles.boldText}>₹{total.toFixed(2)}</Text>
      </View>

      <Text style={{ fontSize: 10, marginTop: 40, color: '#999999', textAlign: 'center' }}>
        Thank you for dining with QRAZY!
      </Text>
    </Page>
  </Document>
);
