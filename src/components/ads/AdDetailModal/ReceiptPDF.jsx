import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
  },
  logoHeader: {
    backgroundColor: "#101F2A",
    padding: 20,
    marginBottom: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 47,
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 40,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 1,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "bold",
  },
  receiptId: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1a1a1a",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "normal",
  },
});

/**
 * @param {{
 *   userData: {
 *     fullName: string;
 *     phone: string;
 *     email: string;
 *   };
 *   adData: {
 *     id: string;
 *     startDate: string;
 *     endDate: string;
 *   };
 *   paymentData: {
 *     method: string;
 *     amount: string;
 *     date: string;
 *   };
 *   logoUrl?: string;
 *   receiptId?: string;
 * }} props
 */
const ReceiptPDF = ({ userData, adData, paymentData, logoUrl, receiptId }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoHeader}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>DETALLE DE PAGO ANUNCIO</Text>
          {receiptId && (
            <Text style={styles.receiptId}>Comprobante #{receiptId}</Text>
          )}
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del usuario</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Nombre y Apellido</Text>
              <Text style={styles.value}>{userData.fullName}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.value}>{userData.phone}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del anuncio</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>ID</Text>
              <Text style={styles.value}>{adData.id}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Desde</Text>
              <Text style={styles.value}>{adData.startDate}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Hasta</Text>
              <Text style={styles.value}>{adData.endDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pago</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Método de pago</Text>
              <Text style={styles.value}>{paymentData.method}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Valor</Text>
              <Text style={styles.value}>{paymentData.amount}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Fecha de pago</Text>
              <Text style={styles.value}>{paymentData.date}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
