"use client";
import React, { useState, useEffect } from 'react';
import styles from './ContactsList.module.scss';
import {ContactCard} from '@/components';
import { Button, Input, PageSkeleton, Spinner } from '@/components/ui';
import SearchIcon from '@/assets/search.svg';
import { deleteContact, getContacts } from '@/actions/contacts';
import { useRouter } from 'next/navigation';

export default function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact => {
      const contactData = contact.contact || contact;
      const name = contactData.firstName + (contactData.lastName ? ` ${contactData.lastName}` : '');
      const role = contactData.role?.key || contactData.role || '';
      
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             role.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts(1, 8);
      setContacts(data.data || []);
      
      // Check if there are more pages
      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.pages);
      } else {
        setHasMore((data.data || []).length === 8);
      }
      
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreContacts = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getContacts(nextPage, 10);
      
      if (data.data && data.data.length > 0) {
        setContacts(prev => [...prev, ...data.data]);
        setPage(nextPage);
        
        // Check if there are more pages
        if (data.pagination) {
          setHasMore(nextPage < data.pagination.pages);
        } else {
          setHasMore(data.data.length === 10);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more contacts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = (contactId) => {
    router.push(`/mensajes?userId=${contactId}`);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await deleteContact(contactId);
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  if (loading) {
    return <PageSkeleton variant="contacts" />;
  }
  return (
    <div className={styles.contactsList}>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Input
            type="text"
            placeholder="Buscar contacto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            rounded="large"
          />
          <SearchIcon className={styles.searchIcon} />
        </div>
      </div>

      <div className={styles.contactsContainer}>
        {filteredContacts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tienes contactos</p>
          </div>
        ) : (
          filteredContacts.map(contact => {
            const contactData = contact.contact || contact;
            const name = contactData.firstName + (contactData.lastName ? ` ${contactData.lastName ?? ''}` : '');
            const role = contactData.role?.key || contactData.role || '';
            
            return (
              <ContactCard
                key={contact.id}
                id={contact.id}
                name={name}
                role={role}
                avatar={contactData.avatarUrl}
                onSendMessage={handleSendMessage}
                onDelete={handleDeleteContact}
              />
            );
          })
        )}
        
        {filteredContacts.length > 0 && hasMore && (
          <div className={styles.loadMore}>
            <Button 
              variant="ghost" 
              onClick={loadMoreContacts}
              disabled={loadingMore}
            >
              {loadingMore ? <>Cargando <Spinner color="white" size="small" /></> : 'Ver más contactos'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
