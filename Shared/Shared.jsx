import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from './../config/FirebaseConfig';

const GetFavList = async (user) => {
  try {
    const docSnap = await getDoc(doc(db, 'userfav', user?.primaryEmailAddress?.emailAddress));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      await setDoc(doc(db, 'userfav', user?.primaryEmailAddress?.emailAddress), {
        email: user?.primaryEmailAddress?.emailAddress,
        favorites: [],
      });
      return { favorites: [] }; // Return empty favorites if created new document
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error; // Re-throw error for further handling
  }
};

const UpdateFav = async (user, favorites) => {
  if (!user?.primaryEmailAddress?.emailAddress) {
    console.error("Invalid user email");
    return;
  }

  if (!Array.isArray(favorites)) {
    console.error("Invalid favorites list:", favorites);
    return;
  }

  const docRef = doc(db, 'userfav', user.primaryEmailAddress.emailAddress);
  
  try {
    await updateDoc(docRef, {
      favorites: favorites.filter(Boolean), // Remove undefined/null values
    });
    console.log("Favorites updated successfully:", favorites);
  } catch (error) {
    console.error('Error updating favorites:', error);
  }
};

export default {
  GetFavList,
  UpdateFav
};