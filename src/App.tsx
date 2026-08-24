import { useState, useEffect, useMemo } from 'react';
import type { Restaurant, Friend, ActiveTab, RestaurantRatingTag, UserProfile } from './types';
import type { Language } from './utils/i18n';
import { 
  loadRestaurants, 
  saveRestaurants, 
  loadFriends, 
  saveFriends,
  importBackupData,
  loadUserProfile,
  saveUserProfile,
  getAutoSyncTime,
  triggerAutoSync
} from './utils/storage';
import { type UserLocation, CITY_COORDS } from './utils/geo';

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
import { UtensilsCrossed } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('bitemap_lang') as Language) || 'zh-TW';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getAutoSyncTime());

  // Real-time / Selected User Location
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<RestaurantRatingTag | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedFriendId, setSelectedFriendId] = useState('all');

  // Modal States
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReelsModalOpen, setIsReelsModalOpen] = useState(false);
  const [isMysteryBoxModalOpen, setIsMysteryBoxModalOpen] = useState(false);
  const [isBillSplitterModalOpen, setIsBillSplitterModalOpen] = useState(false);
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
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('bitemap_lang', newLang);
  };

  const refreshData = () => {
    setRestaurants(loadRestaurants());
    setFriends(loadFriends());
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

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setLastSyncTime(triggerAutoSync());
  };

  const categories = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.category).filter(Boolean));
    return Array.from(set);
  }, [restaurants]);

  const cities = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.city).filter(Boolean));
    return Array.from(set);
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCategory = r.category.toLowerCase().includes(q);
        const matchesCity = r.city.toLowerCase().includes(q);
        const matchesAddress = r.address.toLowerCase().includes(q);
        const matchesMustEat = r.mustEatDishes.some((d) => d.toLowerCase().includes(q));
        const matchesAvoid = r.avoidDishes.some((d) => d.toLowerCase().includes(q));
        const matchesNotes = r.personalNotes.toLowerCase().includes(q);
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
  }, [restaurants, searchQuery, selectedTag, selectedCategory, selectedCity, selectedFriendId]);

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
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
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
        onDataChange={refreshData}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        restaurantCount={restaurants.length}
        friendCount={friends.length}
        lang={lang}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'map' && (
          <div className="space-y-4">
            <MapFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              categories={categories}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelectWithCoords}
              cities={cities}
              selectedFriendId={selectedFriendId}
              onFriendSelect={setSelectedFriendId}
              friends={friends}
              totalCount={restaurants.length}
              filteredCount={filteredRestaurants.length}
              lang={lang}
            />

            {/* Split View Map + Real-time Interactive Sidebar List */}
            <FoodMap
              restaurants={filteredRestaurants}
              friends={friends}
              userLocation={userLocation}
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
              categories={categories}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelectWithCoords}
              cities={cities}
              selectedFriendId={selectedFriendId}
              onFriendSelect={setSelectedFriendId}
              friends={friends}
              totalCount={restaurants.length}
              filteredCount={filteredRestaurants.length}
              lang={lang}
            />

            {filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">
                  {lang === 'zh-TW' ? '找不到符合條件的美食紀錄' : '該当するグルメが見つかりません'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'zh-TW' ? '嘗試調整篩選條件，或點擊上方「新增美食」！' : '検索条件を変更するか、新規追加してください！'}
                </p>
                <button
                  onClick={() => {
                    setEditingRestaurant(null);
                    setIsRestaurantModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {lang === 'zh-TW' ? '新增第一間美食' : '最初のグルメを追加'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    friends={friends}
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
            lang={lang}
            onSaveFriend={handleSaveFriend}
            onDeleteFriend={handleDeleteFriend}
            onViewFriendRestaurants={handleViewFriendRestaurants}
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

      {/* 📱 Reels Feed Modal (Nearest-first sorted!) */}
      <ReelsFeedModal
        isOpen={isReelsModalOpen}
        onClose={() => setIsReelsModalOpen(false)}
        restaurants={restaurants}
        userLocation={userLocation}
        lang={lang}
        onShareRestaurant={(r) => setSharingRestaurant(r)}
        onLocateOnMap={handleLocateOnMap}
      />

      {/* 🎁 Mystery Box Modal (With Attending Friends & Dietary Filter!) */}
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

      {/* 🎲 Bill Splitter Modal */}
      <BillSplitterModal
        isOpen={isBillSplitterModalOpen}
        onClose={() => setIsBillSplitterModalOpen(false)}
        friends={friends}
        lang={lang}
      />
    </div>
  );
}

export default App;
