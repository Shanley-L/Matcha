import React, { useState, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaRedo } from 'react-icons/fa';
import PhotoModal from './PhotoModal';
import '../styles/components/SwipeCard.css';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SwipeCard = ({ user, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const navigate = useNavigate();

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event, info) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      const swipeOutX = info.offset.x > 0 ? 2000 : -2000;
      x.set(swipeOutX);
      setTimeout(() => {
        onSwipe(direction, user.id);
        // If it's a right swipe, also handle the like
        if (direction === 'right') {
          // Make the API call to like the user
          axios.post(`/api/user/like/${user.id}`)
            .then(response => {
              if (response.data.is_match) {
                toast.success(`You matched with ${user.firstname}!`);
                // If a conversation was created, navigate to chats
                if (response.data.conversation_id) {
                  navigate('/chats');
                }
              }
            })
            .catch(error => {
              console.error('Error liking user:', error);
              toast.error('Failed to like user');
            });
        }
      }, 200);
    } else {
      x.set(0);
    }
    // Reset dragging state after a short delay to prevent click event from firing
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  }, [onSwipe, user.id, x, user.firstname, navigate]);

  const calculateAge = useCallback((birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  const handleFlip = useCallback((e) => {
    e.stopPropagation();
    setIsFlipped(prev => !prev);
  }, []);

  const handlePhotoClick = useCallback((photo) => {
    if (isDragging) return;
    if (photo.startsWith('/shared/uploads')) {
      setSelectedPhoto(photo);
    } else {
      setSelectedPhoto(`/shared/uploads${photo}`);
    }
  }, [isDragging]);

  const userAge = useMemo(() => calculateAge(user.birthdate), [user.birthdate, calculateAge]);
  const photos = useMemo(() => 
    typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos
  , [user.photos]);
  
  const firstPhoto = useMemo(() => 
    photos && photos.length > 0 
      ? `/shared/uploads${photos[0]}` 
      : '/default-avatar.png'
  , [photos]);

  const createProfileSections = useCallback(() => {
    const sections = [];
    const remainingPhotos = photos ? photos.slice(1) : [];
    const contentSections = [];

    if (user.bio) {
      contentSections.push({
        key: 'bio',
        content: (
          <div key="bio-section" className="profile-section">
            <h3>About Me</h3>
            <p>{user.bio}</p>
          </div>
        )
      });
    }

    if (user.job) {
      contentSections.push({
        key: 'job',
        content: (
          <div key="job-section" className="profile-section">
            <h3>Occupation</h3>
            <p>{user.job}</p>
          </div>
        )
      });
    }

    if (user.interests) {
      const interests = typeof user.interests === 'string' 
        ? JSON.parse(user.interests) 
        : user.interests;

      contentSections.push({
        key: 'interests',
        content: (
          <div key="interests-section" className="profile-section">
            <h3>Interests</h3>
            <div className="interests-list">
              {interests.map((interest, index) => (
                <span key={`interest-${index}`} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )
      });
    }

    if (user.country) {
      contentSections.push({
        key: 'location',
        content: (
          <div key="location-section" className="profile-section">
            <h3>Location</h3>
            <p>{user.country}</p>
          </div>
        )
      });
    }

    contentSections.forEach((section, index) => {
      sections.push(
        <div key={`section-${section.key}`}>
          {section.content}
        </div>
      );
      if (remainingPhotos[index]) {
        sections.push(
          <div 
            key={`photo-section-${index}`}
            className="profile-photo"
            style={{ 
              backgroundImage: `url(/shared/uploads/${remainingPhotos[index]})`
            }}
            onClick={() => handlePhotoClick(remainingPhotos[index])}
          />
        );
      }
    });

    if (remainingPhotos.length > contentSections.length) {
      remainingPhotos.slice(contentSections.length).forEach((photo, index) => {
        sections.push(
          <div 
            key={`extra-photo-section-${index}`}
            className="profile-photo"
            style={{ 
              backgroundImage: `url(/shared/uploads/${photo})`
            }}
            onClick={() => handlePhotoClick(photo)}
          />
        );
      });
    }

    return sections;
  }, [user.bio, user.job, user.interests, user.country, photos, handlePhotoClick]);

  return (
    <>
      <motion.div
        className="swipe-card"
        drag={!isFlipped ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate: isFlipped ? 0 : rotate, opacity }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of the card */}
          <div className="card-front">
            <div 
              className="card-image"
              style={{ backgroundImage: `url(${firstPhoto})` }}
              onClick={() => handlePhotoClick(photos[0])}
            >
              <div className="flip-button" onClick={handleFlip}>
                <FaRedo />
              </div>
              <div className="card-info">
                <h2 className="card-name">{user.firstname}, {userAge || '?'}</h2>
                {user.job && <p className="card-bio">{user.job}</p>}
              </div>
            </div>
          </div>

          {/* Back of the card */}
          <div className="card-back">
            <div className="flip-button" onClick={handleFlip}>
              <FaRedo style={{ transform: 'scaleX(-1)' }} />
            </div>
            <div className="profile-details">
              <h2>{user.firstname}'s Profile</h2>
              <div className="profile-content">
                {createProfileSections()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <PhotoModal 
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default SwipeCard; 