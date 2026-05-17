"use client";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@/components/ui";
import { sendContactRequest, cancelContactRequest, acceptContactRequest, rejectContactRequest } from "@/actions";
import styles from "./ContactStatusButton.module.scss";
import UserPlusIcon from "@/assets/user-plus.svg";
import UserCheckIcon from "@/assets/user-plus.svg";
import { createChat } from "@/actions/chat";
import { useRouter } from "next/navigation";
/**
 * @param {{ 
 *   contactStatus: { status: string; type: string; requestId?: string }; 
 *   userId: string; 
 *   currentUserId: string;
 *   onStatusChange?: (newStatus: string) => void;
 *   isSearchContext?: boolean;
 * }} props
 */
export default function ContactStatusButton({ contactStatus, userId, currentUserId, onStatusChange, isSearchContext = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(contactStatus?.status || 'none');
  const [currentRequestId, setCurrentRequestId] = useState(contactStatus?.requestId);
  
  const router = useRouter();
  // Sync state when contactStatus prop changes
  useEffect(() => {
    setCurrentStatus(contactStatus?.status || 'none');
    setCurrentRequestId(contactStatus?.requestId);
  }, [contactStatus]);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      const response = await sendContactRequest(userId, '');
      setCurrentStatus('pending');
      setCurrentRequestId(response?.id || response?.requestId);
      onStatusChange?.('pending');
    } catch (error) {
      console.error('Error sending contact request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!currentRequestId) return;
    
    setIsLoading(true);
    try {
      await cancelContactRequest(currentRequestId);
      setCurrentStatus('none');
      setCurrentRequestId(null);
      onStatusChange?.('none');
    } catch (error) {
      console.error('Error cancelling contact request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentRequestId) return;
    
    setIsLoading(true);
    try {
      await acceptContactRequest(currentRequestId);
      setCurrentStatus('connected');
      setCurrentRequestId(null);
      onStatusChange?.('connected');
      await createChat(currentUserId, userId);
      router.refresh();
    } catch (error) {
      console.error('Error accepting contact request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!currentRequestId) return;
    
    setIsLoading(true);
    try {
      await rejectContactRequest(currentRequestId);
      setCurrentStatus('rejected');
      setCurrentRequestId(null);
      onStatusChange?.('rejected');
    } catch (error) {
      console.error('Error rejecting contact request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Navigate to messages with this user
    window.location.href = `/mensajes?userId=${userId}`;
  };
  const renderButton = () => {
    // Handle received requests differently
    if (currentStatus === 'pending' && contactStatus?.type === 'received') {
      return (
        <div className={styles.receivedRequestButtons}>
          <Button  
            onClick={handleAcceptRequest}
            disabled={isLoading}
            icon={!isSearchContext ? <UserCheckIcon /> : undefined}
            iconPosition="right"
          >
            {isLoading ? <>Aceptando <Spinner color="white" /></> : 'Aceptar Solicitud'}
          </Button>
          {!isSearchContext && (<Button  
            onClick={handleRejectRequest}
            disabled={isLoading}
            variant="light-blue"
            iconPosition="right"
          >
            {isLoading ? <>Rechazando <Spinner color="white" /></> : 'Rechazar'}
          </Button>
          )}
        </div>
      );
    }

    switch (currentStatus) {
      case 'pending':
        return (
          <Button  
              onClick={handleCancelRequest}
              disabled={isLoading}
            >
              {isLoading ? <>Cancelando <Spinner color="white" /></> : 'Cancelar solicitud'}
            </Button>      
        );
      case 'connected':
      case 'accepted':
        return (
          <Button 
            variant="primary" 
            onClick={handleSendMessage}
          >
            Enviar mensaje
          </Button>
        );
      
      case 'rejected':
      case 'none':
      default:
        return (
          <Button 
            variant="primary" 
            onClick={handleSendRequest}
            disabled={isLoading}
            icon={!isSearchContext ? <UserPlusIcon /> : undefined}
            iconPosition="right"
          >
            {isLoading ? <>Enviando <Spinner color="white" /></> : (isSearchContext ? 'Seguir' : 'Enviar solicitud')}
          </Button>
        );
    }
  };
  // Don't render if no userId
  if (!userId) {
    return null;
  }

  return (
    <div className={styles.contactStatusContainer}>
      {renderButton()}
    </div>
  );
}
