'use client';

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import type { ImageAnalysisResult } from '@/lib/types';
// import { analyzeListingImage } from '@/ai/flows/analyze-listing-image'; // Uncomment when ready to implement

export function ImageAnalysisTool() {
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
      setAnalysisResult(null); // Reset previous results
      setError(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Simulate API call / AI flow
    // const reader = new FileReader();
    // reader.readAsDataURL(selectedImage);
    // reader.onloadend = async () => {
    //   try {
    //     const photoDataUri = reader.result as string;
    //     // const result = await analyzeListingImage({ photoDataUri }); // Actual AI call
    //     // setAnalysisResult(result);
        
    //     // Placeholder result:
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    const mockResult: ImageAnalysisResult = {
      isAuthentic: Math.random() > 0.3, // Simulate authenticity
      issues: Math.random() > 0.5 ? ['Potential copyright concern.', 'Image seems blurry.'] : [],
    };
    setAnalysisResult(mockResult);

    //   } catch (err) {
    //     setError('Failed to analyze image. Please try again.');
    //     console.error(err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // reader.onerror = () => {
    //   setError('Failed to read image file.');
    //   setIsLoading(false);
    // };
    setIsLoading(false); // Remove this when actual AI call is implemented
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" /> AI Image Analysis
        </CardTitle>
        <CardDescription>
          Upload an image to verify product authenticity and flag potential issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="listing-image-analysis" className="block mb-2 text-sm font-medium">Upload Image</Label>
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
            <img src={imagePreview} alt="Selected preview" className="max-h-60 rounded-md border" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleAnalyzeImage} disabled={!selectedImage || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Image'
          )}
        </Button>

        {analysisResult && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-lg">Analysis Results:</h4>
            {analysisResult.isAuthentic ? (
              <Alert variant="default" className="bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-700 dark:text-green-300">Authenticity Verified</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">
                  The image appears to be authentic.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Potential Authenticity Issues</AlertTitle>
                <AlertDescription>
                  The image may have authenticity concerns.
                </AlertDescription>
              </Alert>
            )}

            {analysisResult.issues.length > 0 && (
              <div>
                <h5 className="font-medium mb-1">Potential Issues Found:</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
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
