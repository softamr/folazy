'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { placeholderCategories } from '@/lib/placeholder-data';
import { Filter, Search, X } from 'lucide-react';
import React, { useState } from 'react';

export function FilterBar() {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const handleResetFilters = () => {
    setPriceRange([0, 2000]);
    setLocation('');
    setCategory('');
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div>
          <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category-filter" className="w-full mt-1">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {placeholderCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location-filter" className="text-sm font-medium">Location</Label>
          <Input
            id="location-filter"
            type="text"
            placeholder="e.g., New York, NY"
            className="mt-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <Label htmlFor="price-range-filter" className="text-sm font-medium">
            Price Range: ${priceRange[0]} - ${priceRange[1]}{priceRange[1] === 2000 ? '+' : ''}
          </Label>
          <Slider
            id="price-range-filter"
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
            className="mt-2"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:col-span-2 lg:col-span-1">
            <Button className="w-full flex-grow">
                <Search className="mr-2 h-4 w-4" /> Search
            </Button>
            <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" /> Reset
            </Button>
        </div>
      </div>
    </div>
  );
}
