import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyFormProps {
  onAnalysisComplete?: (result: any) => void;
}

export default function PropertyForm({ onAnalysisComplete }: PropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    size_sqm: 100,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    has_elevator: false,
    has_parking: false,
    finishing_quality: "medium",
    near_beach: false,
    property_value_egp: "",
  });

  const analyzeMutation = trpc.agent.analyze.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      toast.success("Analysis completed successfully!");
      onAnalysisComplete?.(data);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      location: formData.location,
      size_sqm: Number(formData.size_sqm),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      floor: Number(formData.floor),
      has_elevator: formData.has_elevator,
      has_parking: formData.has_parking,
      finishing_quality: formData.finishing_quality as any,
      near_beach: formData.near_beach,
      property_value_egp: formData.property_value_egp ? Number(formData.property_value_egp) : undefined,
    };

    analyzeMutation.mutate(payload);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Property Analysis Form</CardTitle>
        <CardDescription>
          Enter property details to get AI-powered pricing recommendations and launch readiness assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Zamalek, Cairo or Sidi Gaber, Alexandria"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">City and neighborhood</p>
          </div>

          {/* Property Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size_sqm">Size (sqm)</Label>
              <Input
                id="size_sqm"
                type="number"
                placeholder="100"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="2"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Bathrooms & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="floor">Floor Number</Label>
              <Input
                id="floor"
                type="number"
                placeholder="1"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Finishing Quality */}
          <div>
            <Label htmlFor="finishing">Finishing Quality</Label>
            <Select value={formData.finishing_quality} onValueChange={(val) => setFormData({ ...formData, finishing_quality: val })}>
              <SelectTrigger id="finishing">
                <SelectValue placeholder="Select finishing quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="elevator"
                  checked={formData.has_elevator}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_elevator: checked as boolean })}
                />
                <Label htmlFor="elevator" className="font-normal cursor-pointer">
                  Has Elevator
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking"
                  checked={formData.has_parking}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_parking: checked as boolean })}
                />
                <Label htmlFor="parking" className="font-normal cursor-pointer">
                  Has Parking
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beach"
                  checked={formData.near_beach}
                  onCheckedChange={(checked) => setFormData({ ...formData, near_beach: checked as boolean })}
                />
                <Label htmlFor="beach" className="font-normal cursor-pointer">
                  Near Beach
                </Label>
              </div>
            </div>
          </div>

          {/* Property Value */}
          <div>
            <Label htmlFor="property_value">Property Value (EGP) - Optional</Label>
            <Input
              id="property_value"
              type="number"
              placeholder="1500000"
              value={formData.property_value_egp}
              onChange={(e) => setFormData({ ...formData, property_value_egp: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Used to calculate pricing recommendations</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Property"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
