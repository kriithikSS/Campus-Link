import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from './../config/FirebaseConfig';

const GetFavList = async (user) => {
  try {
    if (!user?.primaryEmailAddress?.emailAddress) return { favorites: [] };

    const docRef = doc(db, 'userfav', user.primaryEmailAddress.emailAddress);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 🔥 Small delay to let Firestore update
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("🟢 Successfully fetched favorites:", docSnap.data().favorites);
      return { favorites: docSnap.data().favorites || [] };
    } else {
      console.log("⚠️ No favorites found, creating new document...");
      await setDoc(docRef, { email: user.primaryEmailAddress.emailAddress, favorites: [] });
      return { favorites: [] };
    }
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    return { favorites: [] };
  }
};


const UpdateFav = async (user, favorites) => {
  if (!user?.primaryEmailAddress?.emailAddress) {
    console.error("❌ Invalid user email");
    return;
  }

  if (!Array.isArray(favorites)) {
    console.error("❌ Invalid favorites list:", favorites);
    return;
  }

  const docRef = doc(db, 'userfav', user.primaryEmailAddress.emailAddress);
  
  try {
    console.log("🟢 Attempting to update Firestore with:", favorites);
    
    // 🔥 Fix: Ensure data is properly saved in Firestore
    await setDoc(docRef, { 
      email: user.primaryEmailAddress.emailAddress, 
      favorites: favorites 
    }, { merge: true }); // ✅ Ensures existing data isn't overwritten

    console.log("✅ Favorites successfully updated in Firestore!");
  } catch (error) {
    console.error("❌ Firestore update error:", error);
  }
};


export default {
  GetFavList,
  UpdateFav
};
