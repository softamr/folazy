
// src/app/admin/categories/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, deleteDoc, arrayRemove, writeBatch, getDocs, query as firestoreQuery, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronRight, Loader2, PackageOpen, ListOrdered, Tags, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import * as Icons from 'lucide-react';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

export default function CategoryManagementPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIconName, setNewCategoryIconName] = useState('');
  
  const [showSubcategoryFormFor, setShowSubcategoryFormFor] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryIconName, setNewSubcategoryIconName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsLoading(true);
    const q = firestoreQuery(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedCategories: Category[] = [];
      querySnapshot.forEach((docSnapshot) => {
        fetchedCategories.push({ id: docSnapshot.id, ...docSnapshot.data() } as Category);
      });
      setCategories(fetchedCategories.sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching categories: ", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Validation Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        iconName: newCategoryIconName.trim() || undefined, // Store as undefined if empty
        subcategories: []
      });
      toast({ title: "Success", description: `Category "${newCategoryName}" added.` });
      setNewCategoryName('');
      setNewCategoryIconName('');
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubcategory = async (parentId: string) => {
    if (!newSubcategoryName.trim()) {
      toast({ title: "Validation Error", description: "Subcategory name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const parentDocRef = doc(db, 'categories', parentId);
    const subcategoryId = generateSlug(newSubcategoryName.trim());
    try {
      await updateDoc(parentDocRef, {
        subcategories: arrayUnion({
          id: subcategoryId,
          name: newSubcategoryName.trim(),
          iconName: newSubcategoryIconName.trim() || undefined,
        })
      });
      toast({ title: "Success", description: `Subcategory "${newSubcategoryName}" added.` });
      setNewSubcategoryName('');
      setNewSubcategoryIconName('');
      setShowSubcategoryFormFor(null);
    } catch (error) {
      console.error("Error adding subcategory: ", error);
      toast({ title: "Error", description: "Could not add subcategory.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete category "${categoryName}" and all its subcategories? This action cannot be undone.`)) {
      setIsSubmitting(true);
      try {
        // Check if any listings use this category or its subcategories. This is a client-side check and might be incomplete for large datasets.
        // A more robust solution would be a Firebase Function.
        const parentCategory = categories.find(c => c.id === categoryId);
        const categoryIdsToCheck = [categoryId, ...(parentCategory?.subcategories?.map(sc => sc.id) || [])];
        
        // This check is illustrative and simplified. For production, consider backend checks or disabling delete if in use.
        const listingsQuery = firestoreQuery(collection(db, "listings"), where("category.id", "in", categoryIdsToCheck));
        const listingsSnapshot = await getDocs(listingsQuery);
        if (!listingsSnapshot.empty) {
            toast({ title: "Deletion Blocked", description: `Cannot delete category "${categoryName}" as it or its subcategories are associated with existing listings.`, variant: "destructive", duration: 5000 });
            setIsSubmitting(false);
            return;
        }
        
        await deleteDoc(doc(db, 'categories', categoryId));
        toast({ title: "Success", description: `Category "${categoryName}" deleted.` });
      } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteSubcategory = async (parentId: string, subcategory: Category) => {
     if (window.confirm(`Are you sure you want to delete subcategory "${subcategory.name}"? This action cannot be undone.`)) {
      setIsSubmitting(true);
      const parentDocRef = doc(db, 'categories', parentId);
      try {
        // Again, a robust check for listings using this subcategory should ideally be on the backend.
        const listingsQuery = firestoreQuery(collection(db, "listings"), where("subcategory.id", "==", subcategory.id));
        const listingsSnapshot = await getDocs(listingsQuery);
        if (!listingsSnapshot.empty) {
             toast({ title: "Deletion Blocked", description: `Cannot delete subcategory "${subcategory.name}" as it's associated with existing listings.`, variant: "destructive", duration: 5000 });
            setIsSubmitting(false);
            return;
        }

        await updateDoc(parentDocRef, {
          subcategories: arrayRemove(subcategory) // arrayRemove needs the exact object to remove
        });
        toast({ title: "Success", description: `Subcategory "${subcategory.name}" deleted.` });
      } catch (error) {
        console.error("Error deleting subcategory: ", error);
        toast({ title: "Error", description: "Could not delete subcategory.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const IconPreview = ({ iconName }: { iconName?: string }) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName] || Icons.Package; // Fallback icon
    return <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center"><ListOrdered className="mr-2 h-7 w-7"/>Category Management</h1>
          <p className="text-muted-foreground">Add, view, and manage main categories and their subcategories.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Main Category</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="newCategoryName">Category Name</Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Electronics"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newCategoryIconName">Icon Name (Lucide)</Label>
            <Input
              id="newCategoryIconName"
              value={newCategoryIconName}
              onChange={(e) => setNewCategoryIconName(e.target.value)}
              placeholder="e.g., Laptop, Car (optional)"
              disabled={isSubmitting}
            />
          </div>
          <Button onClick={handleAddCategory} disabled={isSubmitting || !newCategoryName.trim()} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Category
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>Found {categories.length} main categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-10 text-center">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No categories created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70" onClick={() => toggleExpandCategory(category.id)}>
                    <div className="flex items-center">
                        {expandedCategories[category.id] ? <ChevronDown className="h-5 w-5 mr-2"/> : <ChevronRight className="h-5 w-5 mr-2"/>}
                        <IconPreview iconName={category.iconName} />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowSubcategoryFormFor(category.id); setNewSubcategoryName(''); setNewSubcategoryIconName('');}} disabled={isSubmitting}>
                            <PlusCircle className="h-4 w-4 mr-1 sm:mr-2"/> <span className="hidden sm:inline">Add Subcategory</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id, category.name);}} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Delete Category</span>
                        </Button>
                    </div>
                  </CardHeader>
                  {expandedCategories[category.id] && (
                    <CardContent className="p-4 space-y-3">
                      {showSubcategoryFormFor === category.id && (
                        <Card className="p-4 bg-secondary/50">
                          <CardTitle className="text-md mb-2">Add Subcategory to "{category.name}"</CardTitle>
                          <div className="grid sm:grid-cols-3 gap-3 items-end">
                             <div className="space-y-1">
                                <Label htmlFor={`newSubName-${category.id}`}>Subcategory Name</Label>
                                <Input id={`newSubName-${category.id}`} value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="e.g., Mobile Phones" disabled={isSubmitting} />
                             </div>
                             <div className="space-y-1">
                                <Label htmlFor={`newSubIcon-${category.id}`}>Icon Name (Lucide)</Label>
                                <Input id={`newSubIcon-${category.id}`} value={newSubcategoryIconName} onChange={(e) => setNewSubcategoryIconName(e.target.value)} placeholder="e.g., Smartphone (optional)" disabled={isSubmitting} />
                             </div>
                             <div className="flex gap-2">
                                <Button onClick={() => handleAddSubcategory(category.id)} disabled={isSubmitting || !newSubcategoryName.trim()} className="flex-grow">
                                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Add
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowSubcategoryFormFor(null)} disabled={isSubmitting}><X className="h-4 w-4"/></Button>
                             </div>
                          </div>
                        </Card>
                      )}
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <div className="space-y-2 pl-4 border-l-2 ml-2">
                          <h4 className="font-medium text-sm text-muted-foreground">Subcategories:</h4>
                          {category.subcategories.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
                              <div className="flex items-center">
                                <IconPreview iconName={sub.iconName} />
                                <span>{sub.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">(ID: {sub.id})</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(category.id, sub); }} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                                <Trash2 className="h-3 w-3" />
                                <span className="sr-only">Delete Subcategory</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground pl-6">No subcategories yet.</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
