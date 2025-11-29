import { API_URl } from "@/exportdata";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const BASE_URL = API_URl || "http://localhost:3005";

async function request(endpoint: string, method: string, body?: object) {
    const token = await AsyncStorage.getItem('token');
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        // console.log(res);
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Something went wrong");
        }

        return data;
    } catch (error:any) {
        Alert.alert("API Error:", error.message);
        throw error;
    }
}

export function askOtp(mobileNo: string) {
    return request("/api/user/login", "POST", { mobileNo });
}

export function verifyOtp(mobileNo: string, otp: string) {
    return request("/api/user/verifyotp", "PUT", { mobileNo, otp });
}

export function updateProfile(mobileNo: string, name: string, username: string) {
    return request("/api/user/updateprofile", "PUT", { mobileNo, name, username });
}

export function getContacts() {
    return request(`/api/message/contacts`, "GET");
}

export function getMessages(receiver: string) {
    return request(`/api/message/allmessages/${receiver}`, "GET");
}

export function searchContact(name: string) {
    return request(`/api/message/searchname?name=${name}`, "get");
}