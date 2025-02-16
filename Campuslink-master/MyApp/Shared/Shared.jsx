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
  const docRef = doc(db, 'userfav', user?.primaryEmailAddress?.emailAddress);
  try {
    await updateDoc(docRef, {
      favorites: favorites,
    });
  } catch (error) {
    console.error('Error updating favorites:', error); // Log the error for debugging
    throw error; // Re-throw error for further handling
  }
};

export default {
  GetFavList,
  UpdateFav
};
