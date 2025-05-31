
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
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronRight, Loader2, PackageOpen, ListOrdered, Tags, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const translations = {
  en: {
    pageTitle: "Category Management",
    pageDescription: "Add, view, and manage main categories and their subcategories. Drag to reorder main categories.",
    addMainCategoryTitle: "Add New Main Category",
    categoryNameLabel: "Category Name",
    categoryNamePlaceholder: "e.g., Electronics",
    iconNameLabel: "Icon Name (Lucide)",
    iconNamePlaceholder: "e.g., Laptop, Car (optional)",
    addCategoryButton: "Add Category",
    existingCategoriesTitle: "Existing Categories",
    foundCategoriesDesc: (count: number) => `Found ${count} main categories.`,
    noCategoriesYet: "No categories created yet.",
    addSubcategoryButton: "Add Subcategory",
    deleteCategoryButtonSr: "Delete Category",
    moveCategoryUpSr: "Move Category Up",
    moveCategoryDownSr: "Move Category Down",
    addSubcategoryToTitle: (name: string) => `Add Subcategory to "${name}"`,
    subcategoryNameLabel: "Subcategory Name",
    subcategoryNamePlaceholder: "e.g., Mobile Phones",
    subcategoryIconPlaceholder: "e.g., Smartphone (optional)",
    addButton: "Add",
    subcategoriesSectionTitle: "Subcategories:",
    noSubcategoriesYet: "No subcategories yet.",
    deleteSubcategoryButtonSr: "Delete Subcategory",
    loadingCategories: "Loading categories...",
    validationErrorTitle: "Validation Error",
    categoryNameEmptyError: "Category name cannot be empty.",
    subcategoryNameEmptyError: "Subcategory name cannot be empty.",
    successTitle: "Success",
    errorTitle: "Error",
    categoryAddedSuccess: (name: string) => `Category "${name}" added.`,
    couldNotAddCategoryError: "Could not add category.",
    subcategoryAddedSuccess: (name: string) => `Subcategory "${name}" added.`,
    couldNotAddSubcategoryError: "Could not add subcategory.",
    deleteConfirm: (name: string, type: string) => `Are you sure you want to delete ${type} "${name}"? This action cannot be undone.`,
    deleteCategoryConfirm: (name: string) => `Are you sure you want to delete category "${name}" and all its subcategories? This action cannot be undone.`,
    categoryDeletedSuccess: (name: string) => `Category "${name}" deleted.`,
    couldNotDeleteCategoryError: "Could not delete category.",
    subcategoryDeletedSuccess: (name: string) => `Subcategory "${name}" deleted.`,
    couldNotDeleteSubcategoryError: "Could not delete subcategory.",
    deletionBlockedTitle: "Deletion Blocked",
    deletionBlockedCategoryDesc: (name: string) => `Cannot delete category "${name}" as it or its subcategories are associated with existing listings.`,
    deletionBlockedSubcategoryDesc: (name: string) => `Cannot delete subcategory "${name}" as it's associated with existing listings.`,
    categoryOrderUpdated: "Category order updated.",
    couldNotUpdateOrder: "Could not update category order.",
  },
  ar: {
    pageTitle: "إدارة الفئات",
    pageDescription: "إضافة وعرض وإدارة الفئات الرئيسية والفئات الفرعية. اسحب لإعادة ترتيب الفئات الرئيسية.",
    addMainCategoryTitle: "إضافة فئة رئيسية جديدة",
    categoryNameLabel: "اسم الفئة",
    categoryNamePlaceholder: "مثال: إلكترونيات",
    iconNameLabel: "اسم الأيقونة (Lucide)",
    iconNamePlaceholder: "مثال: Laptop, Car (اختياري)",
    addCategoryButton: "إضافة فئة",
    existingCategoriesTitle: "الفئات الحالية",
    foundCategoriesDesc: (count: number) => `تم العثور على ${count} فئات رئيسية.`,
    noCategoriesYet: "لم يتم إنشاء فئات بعد.",
    addSubcategoryButton: "إضافة فئة فرعية",
    deleteCategoryButtonSr: "حذف الفئة",
    moveCategoryUpSr: "نقل الفئة لأعلى",
    moveCategoryDownSr: "نقل الفئة لأسفل",
    addSubcategoryToTitle: (name: string) => `إضافة فئة فرعية إلى "${name}"`,
    subcategoryNameLabel: "اسم الفئة الفرعية",
    subcategoryNamePlaceholder: "مثال: هواتف محمولة",
    subcategoryIconPlaceholder: "مثال: Smartphone (اختياري)",
    addButton: "إضافة",
    subcategoriesSectionTitle: "الفئات الفرعية:",
    noSubcategoriesYet: "لا توجد فئات فرعية بعد.",
    deleteSubcategoryButtonSr: "حذف الفئة الفرعية",
    loadingCategories: "جار تحميل الفئات...",
    validationErrorTitle: "خطأ في التحقق",
    categoryNameEmptyError: "لا يمكن أن يكون اسم الفئة فارغًا.",
    subcategoryNameEmptyError: "لا يمكن أن يكون اسم الفئة الفرعية فارغًا.",
    successTitle: "نجاح",
    errorTitle: "خطأ",
    categoryAddedSuccess: (name: string) => `تمت إضافة الفئة "${name}".`,
    couldNotAddCategoryError: "لم نتمكن من إضافة الفئة.",
    subcategoryAddedSuccess: (name: string) => `تمت إضافة الفئة الفرعية "${name}".`,
    couldNotAddSubcategoryError: "لم نتمكن من إضافة الفئة الفرعية.",
    deleteConfirm: (name: string, type: string) => `هل أنت متأكد أنك تريد حذف ${type} "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    deleteCategoryConfirm: (name: string) => `هل أنت متأكد أنك تريد حذف الفئة "${name}" وجميع فئاتها الفرعية؟ لا يمكن التراجع عن هذا الإجراء.`,
    categoryDeletedSuccess: (name: string) => `تم حذف الفئة "${name}".`,
    couldNotDeleteCategoryError: "لم نتمكن من حذف الفئة.",
    subcategoryDeletedSuccess: (name: string) => `تم حذف الفئة الفرعية "${name}".`,
    couldNotDeleteSubcategoryError: "لم نتمكن من حذف الفئة الفرعية.",
    deletionBlockedTitle: "تم حظر الحذف",
    deletionBlockedCategoryDesc: (name: string) => `لا يمكن حذف الفئة "${name}" لأنها أو فئاتها الفرعية مرتبطة بإعلانات موجودة.`,
    deletionBlockedSubcategoryDesc: (name: string) => `لا يمكن حذف الفئة الفرعية "${name}" لأنها مرتبطة بإعلانات موجودة.`,
    categoryOrderUpdated: "تم تحديث ترتيب الفئات.",
    couldNotUpdateOrder: "لم نتمكن من تحديث ترتيب الفئات.",
  }
};

export default function CategoryManagementPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

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
      // Sort by 'order' field, then by name as a fallback
      setCategories(
        fetchedCategories.sort((a, b) => {
          const orderA = a.order ?? Infinity;
          const orderB = b.order ?? Infinity;
          if (orderA === orderB) {
            return a.name.localeCompare(b.name);
          }
          return orderA - orderB;
        })
      );
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching categories: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddCategoryError, variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast, t]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: t.validationErrorTitle, description: t.categoryNameEmptyError, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const newOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 0;

    const categoryData: Omit<Category, 'id'> = {
        name: newCategoryName.trim(),
        subcategories: [],
        order: newOrder,
    };
    const trimmedIconName = newCategoryIconName.trim();
    if (trimmedIconName) {
        categoryData.iconName = trimmedIconName;
    }

    try {
      await addDoc(collection(db, 'categories'), categoryData);
      toast({ title: t.successTitle, description: t.categoryAddedSuccess(newCategoryName) });
      setNewCategoryName('');
      setNewCategoryIconName('');
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddCategoryError, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubcategory = async (parentId: string) => {
    if (!newSubcategoryName.trim()) {
      toast({ title: t.validationErrorTitle, description: t.subcategoryNameEmptyError, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const parentDocRef = doc(db, 'categories', parentId);
    const subcategoryId = generateSlug(newSubcategoryName.trim());
    
    const subcategoryData: { id: string; name: string; iconName?: string } = {
        id: subcategoryId,
        name: newSubcategoryName.trim(),
    };
    const trimmedIconName = newSubcategoryIconName.trim();
    if (trimmedIconName) {
        subcategoryData.iconName = trimmedIconName;
    }

    try {
      await updateDoc(parentDocRef, {
        subcategories: arrayUnion(subcategoryData)
      });
      toast({ title: t.successTitle, description: t.subcategoryAddedSuccess(newSubcategoryName) });
      setNewSubcategoryName('');
      setNewSubcategoryIconName('');
      setShowSubcategoryFormFor(null);
    } catch (error) {
      console.error("Error adding subcategory: ", error);
      toast({ title: t.errorTitle, description: t.couldNotAddSubcategoryError, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(t.deleteCategoryConfirm(categoryName))) {
      setIsSubmitting(true);
      try {
        const parentCategory = categories.find(c => c.id === categoryId);
        const categoryIdsToCheck = [categoryId, ...(parentCategory?.subcategories?.map(sc => sc.id) || [])];
        
        const listingsQuery = firestoreQuery(collection(db, "listings"), where("category.id", "in", categoryIdsToCheck));
        const listingsSnapshot = await getDocs(listingsQuery);
        if (!listingsSnapshot.empty) {
            toast({ title: t.deletionBlockedTitle, description: t.deletionBlockedCategoryDesc(categoryName), variant: "destructive", duration: 5000 });
            setIsSubmitting(false);
            return;
        }
        
        await deleteDoc(doc(db, 'categories', categoryId));
        toast({ title: t.successTitle, description: t.categoryDeletedSuccess(categoryName) });
      } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteCategoryError, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteSubcategory = async (parentId: string, subcategory: Category) => {
     if (window.confirm(t.deleteConfirm(subcategory.name, language === 'ar' ? 'الفئة الفرعية' : 'subcategory'))) {
      setIsSubmitting(true);
      const parentDocRef = doc(db, 'categories', parentId);
      try {
        const listingsQuery = firestoreQuery(collection(db, "listings"), where("subcategory.id", "==", subcategory.id));
        const listingsSnapshot = await getDocs(listingsQuery);
        if (!listingsSnapshot.empty) {
             toast({ title: t.deletionBlockedTitle, description: t.deletionBlockedSubcategoryDesc(subcategory.name), variant: "destructive", duration: 5000 });
            setIsSubmitting(false);
            return;
        }

        await updateDoc(parentDocRef, {
          subcategories: arrayRemove(subcategory) 
        });
        toast({ title: t.successTitle, description: t.subcategoryDeletedSuccess(subcategory.name) });
      } catch (error) {
        console.error("Error deleting subcategory: ", error);
        toast({ title: t.errorTitle, description: t.couldNotDeleteSubcategoryError, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleMoveCategory = async (currentIndex: number, direction: 'up' | 'down') => {
    setIsSubmitting(true);
    const newCategories = [...categories];
    const categoryToMove = newCategories[currentIndex];
    let otherCategoryIndex = -1;

    if (direction === 'up' && currentIndex > 0) {
      otherCategoryIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < newCategories.length - 1) {
      otherCategoryIndex = currentIndex + 1;
    }

    if (otherCategoryIndex === -1) {
      setIsSubmitting(false);
      return;
    }

    const otherCategory = newCategories[otherCategoryIndex];

    // Swap order values
    const tempOrder = categoryToMove.order;
    categoryToMove.order = otherCategory.order;
    otherCategory.order = tempOrder;

    try {
      const batch = writeBatch(db);
      const docRefMove = doc(db, 'categories', categoryToMove.id);
      const docRefOther = doc(db, 'categories', otherCategory.id);
      batch.update(docRefMove, { order: categoryToMove.order });
      batch.update(docRefOther, { order: otherCategory.order });
      await batch.commit();
      toast({ title: t.successTitle, description: t.categoryOrderUpdated });
      // The onSnapshot listener will automatically update the local 'categories' state and re-sort.
    } catch (error) {
      console.error("Error updating category order: ", error);
      toast({ title: t.errorTitle, description: t.couldNotUpdateOrder, variant: "destructive" });
      // Revert local changes if Firestore update fails (though onSnapshot would eventually correct it)
      categoryToMove.order = otherCategory.order; // Original value of categoryToMove.order
      otherCategory.order = tempOrder; // Original value of otherCategory.order
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const IconPreview = ({ iconName }: { iconName?: string }) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName] || Icons.Package;
    return <IconComponent className="h-4 w-4 me-2 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingCategories}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center"><ListOrdered className="me-2 h-7 w-7"/>{t.pageTitle}</h1>
          <p className="text-muted-foreground">{t.pageDescription}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.addMainCategoryTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="newCategoryName">{t.categoryNameLabel}</Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t.categoryNamePlaceholder}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newCategoryIconName">{t.iconNameLabel}</Label>
            <Input
              id="newCategoryIconName"
              value={newCategoryIconName}
              onChange={(e) => setNewCategoryIconName(e.target.value)}
              placeholder={t.iconNamePlaceholder}
              disabled={isSubmitting}
            />
          </div>
          <Button onClick={handleAddCategory} disabled={isSubmitting || !newCategoryName.trim()} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />}
            {t.addCategoryButton}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.existingCategoriesTitle}</CardTitle>
          <CardDescription>{t.foundCategoriesDesc(categories.length)}</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-10 text-center">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t.noCategoriesYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader 
                    className="flex flex-row items-center justify-between p-4 bg-muted/50"
                  >
                    <div 
                      className="flex items-center flex-grow cursor-pointer hover:bg-muted/70"
                      onClick={() => toggleExpandCategory(category.id)}
                    >
                        {expandedCategories[category.id] ? <ChevronDown className="h-5 w-5 me-2"/> : <ChevronRight className="h-5 w-5 me-2"/>}
                        <IconPreview iconName={category.iconName} />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {/* Display order for debugging, can be removed */}
                        {/* <span className="text-xs text-muted-foreground ms-2">(Order: {category.order ?? 'N/A'})</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleMoveCategory(index, 'up'); }} 
                            disabled={isSubmitting || index === 0}
                            title={t.moveCategoryUpSr}
                        >
                            <ArrowUpCircle className="h-4 w-4" />
                            <span className="sr-only">{t.moveCategoryUpSr}</span>
                        </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); handleMoveCategory(index, 'down'); }} 
                            disabled={isSubmitting || index === categories.length - 1}
                            title={t.moveCategoryDownSr}
                        >
                            <ArrowDownCircle className="h-4 w-4" />
                            <span className="sr-only">{t.moveCategoryDownSr}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowSubcategoryFormFor(category.id); setNewSubcategoryName(''); setNewSubcategoryIconName('');}} disabled={isSubmitting}>
                            <PlusCircle className="h-4 w-4 me-1 sm:me-2"/> <span className="hidden sm:inline">{t.addSubcategoryButton}</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id, category.name);}} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">{t.deleteCategoryButtonSr}</span>
                        </Button>
                    </div>
                  </CardHeader>
                  {expandedCategories[category.id] && (
                    <CardContent className="p-4 space-y-3">
                      {showSubcategoryFormFor === category.id && (
                        <Card className="p-4 bg-secondary/50">
                          <CardTitle className="text-md mb-2">{t.addSubcategoryToTitle(category.name)}</CardTitle>
                          <div className="grid sm:grid-cols-3 gap-3 items-end">
                             <div className="space-y-1">
                                <Label htmlFor={`newSubName-${category.id}`}>{t.subcategoryNameLabel}</Label>
                                <Input id={`newSubName-${category.id}`} value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder={t.subcategoryNamePlaceholder} disabled={isSubmitting} />
                             </div>
                             <div className="space-y-1">
                                <Label htmlFor={`newSubIcon-${category.id}`}>{t.iconNameLabel}</Label>
                                <Input id={`newSubIcon-${category.id}`} value={newSubcategoryIconName} onChange={(e) => setNewSubcategoryIconName(e.target.value)} placeholder={t.subcategoryIconPlaceholder} disabled={isSubmitting} />
                             </div>
                             <div className="flex gap-2">
                                <Button onClick={() => handleAddSubcategory(category.id)} disabled={isSubmitting || !newSubcategoryName.trim()} className="flex-grow">
                                  {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <PlusCircle className="me-2 h-4 w-4" />} {t.addButton}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowSubcategoryFormFor(null)} disabled={isSubmitting}><X className="h-4 w-4"/></Button>
                             </div>
                          </div>
                        </Card>
                      )}
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <div className={`space-y-2 ${language === 'ar' ? 'pr-4 border-r-2 mr-2' : 'pl-4 border-l-2 ml-2'}`}>
                          <h4 className="font-medium text-sm text-muted-foreground">{t.subcategoriesSectionTitle}</h4>
                          {category.subcategories.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
                              <div className="flex items-center">
                                <IconPreview iconName={sub.iconName} />
                                <span>{sub.name}</span>
                                <span className={`text-xs text-muted-foreground ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>(ID: {sub.id})</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(category.id, sub); }} disabled={isSubmitting} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                                <Trash2 className="h-3 w-3" />
                                <span className="sr-only">{t.deleteSubcategoryButtonSr}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'pr-6' : 'pl-6'}`}>{t.noSubcategoriesYet}</p>
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

