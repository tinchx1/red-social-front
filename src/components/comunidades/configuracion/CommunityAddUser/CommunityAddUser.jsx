"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import styles from "./CommunityAddUser.module.scss";
import styleConfig from "@/components/comunidades/configuracion/CommunityConfiguracion/CommunityConfiguracion.module.scss";
import ImageUpload from "@/assets/file-new.svg";
import { Button } from "@/components/ui";
import { clientApi } from "@/lib/api";
import { bulkImportCommunityUsers } from "@/actions/community/communities";

export default function CommunityAddUser({ isModal = false, toggleModal }) {
  const params = useParams();
  const communityId = params?.communityId;

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      const response = await clientApi.get("/communities/bulk-import/template", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla-carga-masiva.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando plantilla:", err);
      setError(err.response?.data?.message || "Error al descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea un archivo Excel
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
      ];
      const isValidType = validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isValidType) {
        setError("Solo se permiten archivos Excel (.xlsx, .xls)");
        setSelectedFile(null);
        const fileInput = document.getElementById("bulkImportFile");
        if (fileInput) {
          fileInput.value = "";
        }
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUploadUsers = async () => {
    try {
      if (!selectedFile) {
        setError("Por favor selecciona un archivo");
        return;
      }

      if (!communityId) {
        setError("ID de comunidad no encontrado");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await bulkImportCommunityUsers(communityId, selectedFile);
      if (!result.success) {
        // Mostrar el mensaje de error del backend o mensaje genérico
        const errorMessage = result.message || "Error al cargar los usuarios";
        setError(errorMessage);
        return;
      }

      const data = result.data;

      // Si hay errores en la importación, mostrarlos
      if (data.errors && data.errors.length > 0) {
        const errorCount = data.errors.length;
        const firstThreeErrors = data.errors.slice(0, 3);
        setError({
          count: errorCount,
          errors: firstThreeErrors
        });
        return;
      }

      const { total, created } = data.summary;

      // Verificar que se hayan procesado usuarios
      if (total === 0) {
        setError("No se encontraron usuarios válidos en el archivo");
        return;
      }

      // Mensaje de éxito
      setSuccess("Empleados agregados correctamente a la comunidad. Las invitaciones han sido enviadas a los empleados cargados. Recibirán un correo para unirse a la comunidad.");
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById("bulkImportFile");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      // Intentar obtener el mensaje de error del backend o usar mensaje genérico
      const errorMessage = "Error al cargar los usuarios";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    const fileInput = document.getElementById("bulkImportFile");
    if (fileInput) {
      fileInput.value = "";
    }
    if (isModal && toggleModal) {
      toggleModal();
    }
  };

  return (
    <div className={styles.card} style={{ border: isModal ? "none" : undefined, padding: isModal ? 0 : undefined }}>
      <h2 className={styles.cardTitle + (isModal ? " " + styles.modalTitle : "")}>{isModal ? "Agregar usuarios a la comunidad" : "Agregar usuarios"}</h2>
      <p className={styles.cardSubtitle}>
        Utilizá esta plantilla para agregar usuarios de manera masiva.
        <br />
        <span>
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading || isLoading}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: isDownloading || isLoading ? "not-allowed" : "pointer",
              textDecoration: "underline",
              opacity: isDownloading || isLoading ? 0.6 : 1,
            }}
          >
            {isDownloading ? "Descargando..." : "Descargala acá"}
          </button>
        </span>
      </p>

      <div className={styles.cardInfo}>
        <p className={styles.cardSubtitle}>
          Una vez que la hayas completado con los datos de cada usuario, cargala
        </p>
        <div className={styleConfig.fileUpload}>
          <input
            type="file"
            id="bulkImportFile"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className={styleConfig.fileInput}
            disabled={isLoading}
          />
          <label
            htmlFor="bulkImportFile"
            className={styleConfig.fileLabel}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <ImageUpload />
            {selectedFile ? selectedFile.name : "Seleccionar archivo"}
          </label>
        </div>
      </div>

      <div className={styles.cardDescription}>
        Al cargar tu nómina de empresa, todos los empleados incluidos serán agregados automáticamente a la nómina de la empresa e invitados a la comunidad.
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {typeof error === "object" ? (
            <div>
              <p style={{ margin: "0 0 8px 0" }}>
                {error.count === 1
                  ? "Se encontró 1 error:"
                  : `Se encontraron ${error.count} errores:`}
              </p>
              <ul style={{ margin: "0", paddingLeft: "20px" }}>
                {error.errors.map((err, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    Fila {err.row}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {success}
        </div>
      )}

      <div className={styles.cardActions}>
        <Button
          variant="link"
          onClick={handleCancel}
          style={{ color: "#929AAB" }}
          disabled={isLoading}

        >
          Cancelar
        </Button>
        <Button
          onClick={handleUploadUsers}
          disabled={!selectedFile || isLoading || isDownloading}
        >
          {isLoading ? "Cargando usuarios..." : "Cargar usuarios"}
        </Button>
      </div>
    </div>
  );
}
