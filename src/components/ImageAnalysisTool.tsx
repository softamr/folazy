
'use client';

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import type { ImageAnalysisResult } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
// import { analyzeListingImage } from '@/ai/flows/analyze-listing-image';

const translations = {
  en: {
    title: "AI Image Analysis",
    description: "Upload an image to verify product authenticity and flag potential issues.",
    uploadLabel: "Upload Image",
    selectImageError: "Please select an image first.",
    analyzeButton: "Analyze Image",
    analyzingButton: "Analyzing...",
    analysisResultsTitle: "Analysis Results:",
    authenticityVerifiedTitle: "Authenticity Verified",
    authenticityVerifiedDesc: "The image appears to be authentic.",
    potentialAuthenticityIssuesTitle: "Potential Authenticity Issues",
    potentialAuthenticityIssuesDesc: "The image may have authenticity concerns.",
    potentialIssuesFoundTitle: "Potential Issues Found:",
    errorFailedToAnalyze: "Failed to analyze image. Please try again.",
    errorFailedToRead: "Failed to read image file.",
    errorTitle: "Error",
    mockIssueCopyright: "Potential copyright concern.",
    mockIssueBlurry: "Image seems blurry.",
    selectedPreviewAlt: "Selected preview",
  },
  ar: {
    title: "تحليل الصور بالذكاء الاصطناعي",
    description: "قم بتحميل صورة للتحقق من أصالة المنتج والإبلاغ عن المشكلات المحتملة.",
    uploadLabel: "تحميل صورة",
    selectImageError: "الرجاء تحديد صورة أولاً.",
    analyzeButton: "تحليل الصورة",
    analyzingButton: "جاري التحليل...",
    analysisResultsTitle: "نتائج التحليل:",
    authenticityVerifiedTitle: "تم التحقق من الأصالة",
    authenticityVerifiedDesc: "الصورة تبدو أصلية.",
    potentialAuthenticityIssuesTitle: "مشاكل محتملة في الأصالة",
    potentialAuthenticityIssuesDesc: "قد تحتوي الصورة على مخاوف تتعلق بالأصالة.",
    potentialIssuesFoundTitle: "المشكلات المحتملة التي تم العثور عليها:",
    errorFailedToAnalyze: "فشل تحليل الصورة. يرجى المحاولة مرة أخرى.",
    errorFailedToRead: "فشل في قراءة ملف الصورة.",
    errorTitle: "خطأ",
    mockIssueCopyright: "قلق محتمل بشأن حقوق النشر.",
    mockIssueBlurry: "الصورة تبدو ضبابية.",
    selectedPreviewAlt: "معاينة محددة",
  }
};

export function ImageAnalysisTool() {
  const { language } = useLanguage();
  const t = translations[language];

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError(t.selectImageError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const mockResult: ImageAnalysisResult = {
      isAuthentic: Math.random() > 0.3,
      issues: Math.random() > 0.5 ? [t.mockIssueCopyright, t.mockIssueBlurry] : [],
    };
    setAnalysisResult(mockResult);
    // TODO: Integrate actual AI call:
    // const reader = new FileReader();
    // reader.readAsDataURL(selectedImage);
    // reader.onloadend = async () => {
    //   try {
    //     const photoDataUri = reader.result as string;
    //     // const result = await analyzeListingImage({ photoDataUri });
    //     // setAnalysisResult(result);
    //   } catch (err) {
    //     setError(t.errorFailedToAnalyze);
    //     console.error(err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // reader.onerror = () => {
    //   setError(t.errorFailedToRead);
    //   setIsLoading(false);
    // };
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className={`h-5 w-5 ${language === 'ar' ? 'ms-2' : 'me-2'}`} /> {t.title}
        </CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="listing-image-analysis" className="block mb-2 text-sm font-medium">{t.uploadLabel}</Label>
          <Input
            id="listing-image-analysis"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file:text-sm file:font-medium"
          />
        </div>

        {imagePreview && (
          <div className="mt-4">
            <img src={imagePreview} alt={t.selectedPreviewAlt} className="max-h-60 rounded-md border" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleAnalyzeImage} disabled={!selectedImage || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
              {t.analyzingButton}
            </>
          ) : (
            t.analyzeButton
          )}
        </Button>

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-lg">{t.analysisResultsTitle}</h4>
            {analysisResult.isAuthentic ? (
              <Alert variant="default" className="bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700">
                <CheckCircle className={`h-4 w-4 text-green-600 dark:text-green-400 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
                <AlertTitle className="text-green-700 dark:text-green-300">{t.authenticityVerifiedTitle}</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {t.authenticityVerifiedDesc}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className={`h-4 w-4 ${language === 'ar' ? 'ms-2' : 'me-2'}`} />
                <AlertTitle>{t.potentialAuthenticityIssuesTitle}</AlertTitle>
                <AlertDescription>
                  {t.potentialAuthenticityIssuesDesc}
                </AlertDescription>
              </Alert>
            )}

            {analysisResult.issues.length > 0 && (
              <div>
                <h5 className="font-medium mb-1">{t.potentialIssuesFoundTitle}</h5>
                <ul className={`list-disc ${language === 'ar' ? 'list-inside-rtl ps-0 pe-4' : 'list-inside'} text-sm text-muted-foreground space-y-1`}>
                  {analysisResult.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
