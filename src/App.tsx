import { useState, useEffect, useMemo } from 'react';
import type { Restaurant, Friend, DiningMeetup, FriendRequest, ActiveTab, RestaurantRatingTag, UserProfile, SortOption } from './types';
import type { Language } from './utils/i18n';
import { 
  loadRestaurants, 
  saveRestaurants, 
  loadFriends, 
  saveFriends,
  importBackupData,
  loadUserProfile,
  saveUserProfile,
  loadMeetups,
  saveMeetups,
  loadFriendRequests,
  saveFriendRequests,
  parseFriendInviteToken,
  getAutoSyncTime,
  triggerAutoSync
} from './utils/storage';
import { type UserLocation, CITY_COORDS, calculateDistanceKm } from './utils/geo';

import { Header } from './components/Layout/Header';
import { TabNavigation } from './components/Layout/TabNavigation';
import { FoodMap } from './components/Map/FoodMap';
import { MapFilterBar } from './components/Map/MapFilterBar';
import { RestaurantCard } from './components/Restaurant/RestaurantCard';
import { RestaurantModal } from './components/Restaurant/RestaurantModal';
import { FriendManager } from './components/Friends/FriendManager';
import { GroupDiningMatcher } from './components/Friends/GroupDiningMatcher';
import { ShareCardModal } from './components/Social/ShareCardModal';
import { DataSyncModal } from './components/Social/DataSyncModal';
import { UserProfileModal } from './components/Layout/UserProfileModal';
import { ReelsFeedModal } from './components/Reels/ReelsFeedModal';
import { MysteryBoxModal } from './components/Tools/MysteryBoxModal';
import { BillSplitterModal } from './components/Tools/BillSplitterModal';
import { AuthModal } from './components/Layout/AuthModal';
import type { AccountRecord } from './utils/storage';
import { findFoodieProfileById } from './utils/storage';
import { UtensilsCrossed } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('bitemap_lang') as Language) || 'zh-TW';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetups, setMeetups] = useState<DiningMeetup[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => loadFriendRequests());
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getAutoSyncTime());

  // Real-time User Location
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const defaultCity = userProfile.defaultCity || (lang === 'ja' ? '東京' : '台北市');
    const coords = CITY_COORDS[defaultCity] || { lat: 25.0478, lng: 121.5319 };
    return {
      lat: coords.lat,
      lng: coords.lng,
      cityName: defaultCity,
      isGps: false,
    };
  });

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<RestaurantRatingTag | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedFriendId, setSelectedFriendId] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('distance'); // Default Nearest

  // Modal States
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReelsModalOpen, setIsReelsModalOpen] = useState(false);
  const [isMysteryBoxModalOpen, setIsMysteryBoxModalOpen] = useState(false);
  const [isBillSplitterModalOpen, setIsBillSplitterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [sharingRestaurant, setSharingRestaurant] = useState<Restaurant | null>(null);
  const [targetMapRestaurant, setTargetMapRestaurant] = useState<Restaurant | null>(null);

  // Auto-detect browser GPS location if permitted
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            cityName: '目前 GPS 位置',
            isGps: true,
          });
        },
        (err) => {
          console.log('Geolocation not available, using default city center', err.message);
        },
        { timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    if (window.location.hash.startsWith('#add-friend=')) {
      try {
        const token = window.location.hash.replace('#add-friend=', '');
        const req = parseFriendInviteToken(token);
        if (req) {
          const existing = loadFriendRequests();
          const updated = [req, ...existing.filter((r) => r.senderFoodieId !== req.senderFoodieId)];
          saveFriendRequests(updated);
          setFriendRequests(updated);
          alert(lang === 'zh-TW' 
            ? `🎉 收到來自【${req.senderName} (${req.senderFoodieId})】的吃貨好友邀請！已為您存入待審核信箱！` 
            : `🎉 ${req.senderName} からフレンド申請が届きました！`);
          window.location.hash = '';
          setActiveTab('friends');
          setLastSyncTime(triggerAutoSync());
        }
      } catch (err) {
        console.error('Failed to parse friend invite hash', err);
      }
    }

    if (window.location.hash.startsWith('#sync=')) {
      try {
        const base64 = window.location.hash.replace('#sync=', '');
        const jsonStr = decodeURIComponent(atob(base64));
        const res = importBackupData(jsonStr);
        if (res.success) {
          alert(lang === 'zh-TW' ? '🎉 成功從同步連結載入美食地圖資料！' : '🎉 同期リンクからグルメデータを読み込みました！');
          window.location.hash = '';
          setLastSyncTime(triggerAutoSync());
        }
      } catch (err) {
        console.error('Failed to parse sync hash', err);
      }
    }

    setRestaurants(loadRestaurants());
    setFriends(loadFriends());
    setMeetups(loadMeetups());
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('bitemap_lang', newLang);
  };

  const refreshData = () => {
    setRestaurants(loadRestaurants());
    setFriends(loadFriends());
    setMeetups(loadMeetups());
    setFriendRequests(loadFriendRequests());
    setLastSyncTime(triggerAutoSync());
  };

  const handleSaveRestaurant = (restaurant: Restaurant) => {
    let updated: Restaurant[];
    const exists = restaurants.some((r) => r.id === restaurant.id);
    if (exists) {
      updated = restaurants.map((r) => (r.id === restaurant.id ? restaurant : r));
    } else {
      updated = [restaurant, ...restaurants];
    }
    setRestaurants(updated);
    saveRestaurants(updated);
    setLastSyncTime(triggerAutoSync());
  };

  const handleDeleteRestaurant = (id: string) => {
    const confirmMsg = lang === 'zh-TW' ? '確定要刪除這間餐廳紀錄嗎？' : 'このグルメ記録を削除しますか？';
    if (confirm(confirmMsg)) {
      const updated = restaurants.filter((r) => r.id !== id);
      setRestaurants(updated);
      saveRestaurants(updated);
      setLastSyncTime(triggerAutoSync());
    }
  };

  const handleIncrementVisit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = restaurants.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          visitCount: (r.visitCount || 0) + 1,
          lastVisitedDate: today,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    setRestaurants(updated);
    saveRestaurants(updated);
    setLastSyncTime(triggerAutoSync());
  };


  const handleAcceptFriendRequest = (req: FriendRequest) => {
    const newFriend: Friend = {
      id: 'f_' + Date.now(),
      foodieId: req.senderFoodieId,
      name: req.senderName,
      avatar: req.senderAvatar || '🥢',
      favoriteTags: req.favoriteTags || [],
      dislikedTags: req.dislikedTags || [],
      notes: req.bio || '透過吃貨 ID 互相綁定好友',
    };

    handleSaveFriend(newFriend);

    const updatedRequests = friendRequests.filter((r) => r.id !== req.id);
    setFriendRequests(updatedRequests);
    saveFriendRequests(updatedRequests);
    setLastSyncTime(triggerAutoSync());

    alert(lang === 'zh-TW' 
      ? `🎉 成功同意添加【${req.senderName}】為吃貨好友！彼此的喜好與忌口已自動同步到您的朋友圈！` 
      : `🎉 ${req.senderName} とフレンド連携が完了しました！`);
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    const updatedRequests = friendRequests.filter((r) => r.id !== requestId);
    setFriendRequests(updatedRequests);
    saveFriendRequests(updatedRequests);
    setLastSyncTime(triggerAutoSync());
  };

  const handleSendFriendRequest = (targetFoodieId: string): { success: boolean; message: string } => {
    const cleanId = targetFoodieId.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, message: '請輸入好友的吃貨 ID！' };
    }

    if (cleanId === userProfile.foodieId.toLowerCase()) {
      return { success: false, message: '不能添加自己的吃貨 ID 唷！' };
    }

    const alreadyFriend = friends.some((f) => f.foodieId?.toLowerCase() === cleanId);
    if (alreadyFriend) {
      return { success: false, message: '您們已經是吃貨好友囉！' };
    }

    // Look up in account registry or mock database
    const foundProfile = findFoodieProfileById(cleanId);
    if (foundProfile) {
      const newIncomingRequest: FriendRequest = {
        id: 'req_' + Date.now(),
        senderFoodieId: foundProfile.foodieId,
        senderName: foundProfile.name,
        senderAvatar: foundProfile.avatar,
        favoriteTags: foundProfile.favoriteTags,
        dislikedTags: foundProfile.dislikedTags,
        bio: foundProfile.bio,
        sentAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      const updatedReqs = [newIncomingRequest, ...friendRequests.filter((r) => r.senderFoodieId !== foundProfile.foodieId)];
      setFriendRequests(updatedReqs);
      saveFriendRequests(updatedReqs);

      return {
        success: true,
        message: `🎉 已向【${foundProfile.name} (${foundProfile.foodieId})】發送好友邀請！已在「待審核信箱」中收到對方的吃貨名片！`,
      };
    }

    // Fallback for custom unlisted IDs
    const mockRequest: FriendRequest = {
      id: 'req_' + Date.now(),
      senderFoodieId: cleanId,
      senderName: cleanId,
      senderAvatar: '🥢',
      favoriteTags: ['拉麵', '美食探店'],
      dislikedTags: [],
      bio: '吃貨好友',
      sentAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    const updatedReqs = [mockRequest, ...friendRequests];
    setFriendRequests(updatedReqs);
    saveFriendRequests(updatedReqs);

    return {
      success: true,
      message: `🚀 已送出好友申請給【${cleanId}】！待審核同意後即可同步口味！`,
    };
  };

  const handleSaveFriend = (friend: Friend) => {
    let updated: Friend[];
    const exists = friends.some((f) => f.id === friend.id);
    if (exists) {
      updated = friends.map((f) => (f.id === friend.id ? friend : f));
    } else {
      updated = [...friends, friend];
    }
    setFriends(updated);
    saveFriends(updated);
    setLastSyncTime(triggerAutoSync());
  };

  const handleDeleteFriend = (id: string) => {
    const updated = friends.filter((f) => f.id !== id);
    setFriends(updated);
    saveFriends(updated);
    setLastSyncTime(triggerAutoSync());
  };


  const handleSaveMeetup = (meetup: DiningMeetup) => {
    const updated = [meetup, ...meetups];
    setMeetups(updated);
    saveMeetups(updated);
    setLastSyncTime(triggerAutoSync());
  };

  const handleDeleteMeetup = (meetupId: string) => {
    if (confirm(lang === 'zh-TW' ? '確定要刪除這則聚餐邀請嗎？' : 'この食事会募集を削除しますか？')) {
      const updated = meetups.filter((m) => m.id !== meetupId);
      setMeetups(updated);
      saveMeetups(updated);
      setLastSyncTime(triggerAutoSync());
    }
  };

  const handleJoinMeetup = (meetupId: string) => {
    const updated = meetups.map((m) => {
      if (m.id === meetupId) {
        const hasJoined = m.joinedFriendIds.includes('me') || m.joinedFriendIds.includes(userProfile.name);
        const newJoined = hasJoined
          ? m.joinedFriendIds.filter((id) => id !== 'me' && id !== userProfile.name)
          : [...m.joinedFriendIds, 'me'];
        return { ...m, joinedFriendIds: newJoined };
      }
      return m;
    });
    setMeetups(updated);
    saveMeetups(updated);
    setLastSyncTime(triggerAutoSync());
  };

  const handleInterestedMeetup = (meetupId: string) => {
    const updated = meetups.map((m) => {
      if (m.id === meetupId) {
        const hasInterested = m.interestedFriendIds.includes('me') || m.interestedFriendIds.includes(userProfile.name);
        const newInterested = hasInterested
          ? m.interestedFriendIds.filter((id) => id !== 'me' && id !== userProfile.name)
          : [...m.interestedFriendIds, 'me'];
        return { ...m, interestedFriendIds: newInterested };
      }
      return m;
    });
    setMeetups(updated);
    saveMeetups(updated);
    setLastSyncTime(triggerAutoSync());
  };

  const handleAddMeetupComment = (meetupId: string, content: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated = meetups.map((m) => {
      if (m.id === meetupId) {
        return {
          ...m,
          comments: [
            ...m.comments,
            {
              id: 'c_' + Date.now(),
              authorName: userProfile.name || '吃貨好友',
              authorAvatar: userProfile.avatar || '🧋',
              content,
              createdAt: timeStr,
            },
          ],
        };
      }
      return m;
    });
    setMeetups(updated);
    saveMeetups(updated);
    setLastSyncTime(triggerAutoSync());
  };


  const handleLoginSuccess = (account: AccountRecord) => {
    setUserProfile(account.profile);
    saveUserProfile(account.profile);

    if (account.restaurants && account.restaurants.length > 0) {
      setRestaurants(account.restaurants);
      saveRestaurants(account.restaurants);
    }
    if (account.friends && account.friends.length > 0) {
      setFriends(account.friends);
      saveFriends(account.friends);
    }
    if (account.meetups && account.meetups.length > 0) {
      setMeetups(account.meetups);
      saveMeetups(account.meetups);
    }

    setLastSyncTime(triggerAutoSync());
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setLastSyncTime(triggerAutoSync());
  };


  const cities = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.city).filter(Boolean));
    return Array.from(set);
  }, [restaurants]);

  // Deep Filtered & Multi-Mode Sorted Restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    // 1. Filter
    const filtered = restaurants.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCategory = r.category.toLowerCase().includes(q);
        const matchesCity = r.city.toLowerCase().includes(q);
        const matchesAddress = r.address.toLowerCase().includes(q);
        const matchesMustEat = r.mustEatDishes.some((d) => d.toLowerCase().includes(q));
        const matchesAvoid = r.avoidDishes.some((d) => d.toLowerCase().includes(q));
        const matchesNotes = r.personalNotes?.toLowerCase().includes(q);
        const matchesVideo = r.videos.some(
          (v) => (v.title && v.title.toLowerCase().includes(q)) || (v.creatorName && v.creatorName.toLowerCase().includes(q))
        );

        if (
          !matchesName &&
          !matchesCategory &&
          !matchesCity &&
          !matchesAddress &&
          !matchesMustEat &&
          !matchesAvoid &&
          !matchesNotes &&
          !matchesVideo
        ) {
          return false;
        }
      }

      if (selectedTag !== 'all' && r.ratingTag !== selectedTag) {
        return false;
      }

      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }

      if (selectedCity !== 'all') {
        if (r.city !== selectedCity) return false;
      }

      if (selectedFriendId !== 'all') {
        const isRecommended = r.recommendedByFriendIds?.includes(selectedFriendId);
        const isDined = r.dinedWithFriendIds?.includes(selectedFriendId);
        if (!isRecommended && !isDined) {
          return false;
        }
      }

      return true;
    });

    // 2. Sort by sortOption
    return [...filtered].sort((a, b) => {
      if (sortOption === 'distance') {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      }

      if (sortOption === 'rating') {
        const rankWeight = {
          must_eat: 5,
          frequent_visit: 4,
          wishlist: 3,
          mediocre: 2,
          avoid_again: 1,
        };
        const weightA = rankWeight[a.ratingTag] || 2;
        const weightB = rankWeight[b.ratingTag] || 2;
        if (weightA !== weightB) return weightB - weightA;
        return (b.googleRating || 0) - (a.googleRating || 0);
      }

      if (sortOption === 'price_asc') {
        const priceWeight = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
        return (priceWeight[a.priceRange] || 2) - (priceWeight[b.priceRange] || 2);
      }

      if (sortOption === 'price_desc') {
        const priceWeight = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
        return (priceWeight[b.priceRange] || 2) - (priceWeight[a.priceRange] || 2);
      }

      if (sortOption === 'visits') {
        return (b.visitCount || 0) - (a.visitCount || 0);
      }

      return 0;
    });
  }, [restaurants, searchQuery, selectedTag, selectedCategory, selectedCity, selectedFriendId, sortOption, userLocation]);

  const handleLocateOnMap = (restaurant: Restaurant) => {
    setTargetMapRestaurant(restaurant);
    setActiveTab('map');
  };

  const handleViewFriendRestaurants = (friendId: string) => {
    setSelectedFriendId(friendId);
    setActiveTab('list');
  };

  const handleCitySelectWithCoords = (city: string) => {
    setSelectedCity(city);
    if (city !== 'all' && CITY_COORDS[city]) {
      setUserLocation({
        lat: CITY_COORDS[city].lat,
        lng: CITY_COORDS[city].lng,
        cityName: city,
        isGps: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header
        restaurants={restaurants}
        lang={lang}
        profile={userProfile}
        lastSyncTime={lastSyncTime}
        onLanguageChange={handleLanguageChange}
        onAddNewRestaurant={() => {
          setEditingRestaurant(null);
          setIsRestaurantModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenReelsModal={() => setIsReelsModalOpen(true)}
        onOpenMysteryBox={() => setIsMysteryBoxModalOpen(true)}
        onOpenBillSplitter={() => setIsBillSplitterModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onDataChange={refreshData}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        restaurantCount={restaurants.length}
        friendCount={friends.length}
        lang={lang}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {activeTab === 'map' && (
          <div className="space-y-3">
            <MapFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelectWithCoords}
              cities={cities}
              selectedFriendId={selectedFriendId}
              onFriendSelect={setSelectedFriendId}
              sortOption={sortOption}
              onSortChange={setSortOption}
              lang={lang}
            />

            {/* Split View Map + Real-time Interactive Sidebar List */}
            <FoodMap
              restaurants={filteredAndSortedRestaurants}
              friends={friends}
              userLocation={userLocation}
              searchQuery={searchQuery}
              lang={lang}
              onEditRestaurant={(r) => {
                setEditingRestaurant(r);
                setIsRestaurantModalOpen(true);
              }}
              onShareRestaurant={(r) => setSharingRestaurant(r)}
              targetRestaurant={targetMapRestaurant}
            />
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4">
            <MapFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelectWithCoords}
              cities={cities}
              selectedFriendId={selectedFriendId}
              onFriendSelect={setSelectedFriendId}
              sortOption={sortOption}
              onSortChange={setSortOption}
              lang={lang}
            />

            {filteredAndSortedRestaurants.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">
                  {lang === 'zh-TW' ? '找不到符合條件的美食紀錄' : '該当するグルメが見つかりません'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'zh-TW' ? '嘗試調整搜尋關鍵字或篩選條件！' : '検索条件を変更してください！'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    friends={friends}
                    searchQuery={searchQuery}
                    lang={lang}
                    onIncrementVisit={handleIncrementVisit}
                    onEdit={(r) => {
                      setEditingRestaurant(r);
                      setIsRestaurantModalOpen(true);
                    }}
                    onDelete={handleDeleteRestaurant}
                    onShare={(r) => setSharingRestaurant(r)}
                    onLocateOnMap={handleLocateOnMap}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <FriendManager
            friends={friends}
            restaurants={restaurants}
            meetups={meetups}
            friendRequests={friendRequests}
            userProfile={userProfile}
            lang={lang}
            onSaveFriend={handleSaveFriend}
            onDeleteFriend={handleDeleteFriend}
            onViewFriendRestaurants={handleViewFriendRestaurants}
            onSaveMeetup={handleSaveMeetup}
            onDeleteMeetup={handleDeleteMeetup}
            onJoinMeetup={handleJoinMeetup}
            onInterestedMeetup={handleInterestedMeetup}
            onAddMeetupComment={handleAddMeetupComment}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
            onSendFriendRequest={handleSendFriendRequest}
          />
        )}

        {activeTab === 'matcher' && (
          <GroupDiningMatcher
            friends={friends}
            restaurants={restaurants}
            lang={lang}
            onIncrementVisit={handleIncrementVisit}
            onEditRestaurant={(r) => {
              setEditingRestaurant(r);
              setIsRestaurantModalOpen(true);
            }}
            onDeleteRestaurant={handleDeleteRestaurant}
            onShareRestaurant={(r) => setSharingRestaurant(r)}
            onLocateOnMap={handleLocateOnMap}
          />
        )}
      </main>

      {/* 🏷️ App Footer with Producer & Version */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500 space-y-1 mt-8">
        <div className="flex items-center justify-center gap-2 flex-wrap font-bold">
          <span className="text-slate-900 font-black">BiteMap 短影音美食地圖</span>
          <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-black border border-amber-300">
            v2.4.0 (Pro Foodie Edition)
          </span>
          <span>·</span>
          <span className="text-slate-800">製作人: <strong className="text-rose-600">k-kaw</strong></span>
        </div>
        <p className="text-[11px] text-slate-400">
          Powered by Google Deepmind AI Pair-Programming · 吃貨專屬避雷手冊與朋友圈系統
        </p>
      </footer>


      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => {
          setIsRestaurantModalOpen(false);
          setEditingRestaurant(null);
        }}
        onSave={handleSaveRestaurant}
        editingRestaurant={editingRestaurant}
        friends={friends}
        lang={lang}
      />

      <ShareCardModal
        isOpen={!!sharingRestaurant}
        onClose={() => setSharingRestaurant(null)}
        restaurant={sharingRestaurant}
        lang={lang}
        userProfile={userProfile}
      />

      <DataSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        lang={lang}
        onDataImported={refreshData}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        lang={lang}
      />

      <ReelsFeedModal
        isOpen={isReelsModalOpen}
        onClose={() => setIsReelsModalOpen(false)}
        restaurants={restaurants}
        userLocation={userLocation}
        lang={lang}
        onShareRestaurant={(r) => setSharingRestaurant(r)}
        onLocateOnMap={handleLocateOnMap}
      />

      <MysteryBoxModal
        isOpen={isMysteryBoxModalOpen}
        onClose={() => setIsMysteryBoxModalOpen(false)}
        restaurants={restaurants}
        friends={friends}
        userProfile={userProfile}
        userLocation={userLocation}
        lang={lang}
        onLocateOnMap={handleLocateOnMap}
      />

      <BillSplitterModal
        isOpen={isBillSplitterModalOpen}
        onClose={() => setIsBillSplitterModalOpen(false)}
        friends={friends}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentProfile={userProfile}
        restaurants={restaurants}
        friends={friends}
        meetups={meetups}
        lang={lang}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
