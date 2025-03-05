import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native'; // ✅ Correct navigation hook

export default function SRMinfo() {
    const route = useRoute();
    const { name, imageUrl } = route.params;
    const decodedImageUrl = decodeURIComponent(imageUrl);
    const [validImageUrl, setValidImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(decodedImageUrl, { method: "HEAD" })
            .then((res) => {
                if (res.ok) {
                    setValidImageUrl(decodedImageUrl);
                } else {
                    console.log("❌ Invalid Image URL:", res.status, res.statusText);
                }
            })
            .catch((error) => console.log("❌ Image Fetch Error:", error))
            .finally(() => setLoading(false));
    }, [decodedImageUrl]);

    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" color="blue" />
            ) : validImageUrl ? (
                <Image
                    source={{ uri: validImageUrl }}
                    style={{ width: '100%', height: 300, resizeMode: 'cover' }}
                />
            ) : (
                <Text>No Image Available</Text>
            )}

            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{name}</Text>
        </View>
    );
}
