import { db } from "@/config/firebase";
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, Timestamp, updateDoc } from "firebase/firestore";
import { Project } from "@/types";

const PROJECTS_COLLECTION = "projects";

export async function createProject(data: { name: string; description: string }) {
  try {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...data,
      createdAt: Timestamp.now(),
      areas: [] // Initialize with empty areas
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        areas: data.areas || []
      } as Project;
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        areas: data.areas || []
      } as Project;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function saveProjectArea(projectId: string, areaData: any) {
  try {
     const docRef = doc(db, PROJECTS_COLLECTION, projectId);
     const projectSnap = await getDoc(docRef);
     
     if (projectSnap.exists()) {
        const currentAreas = projectSnap.data().areas || [];
        // Check if area with same name exists, update if so, else push
        // For simplicity, we just push new ones or replace by ID if we had one (we generate ID here)
        
        const newArea = {
           id: Math.random().toString(36).substr(2, 9),
           createdAt: new Date().toISOString(),
           ...areaData
        };
        
        await updateDoc(docRef, {
           areas: [...currentAreas, newArea]
        });
        
        return newArea;
     }
  } catch (error) {
     console.error("Error saving project area:", error);
     throw error;
  }
}
