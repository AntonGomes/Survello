"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Cloud,
  Image as ImageIcon,
  FileText,
  Users,
  Pencil,
  Check,
  X,
  Download,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  ImageLightbox,
  useLightbox,
} from "@/components/ui/image-lightbox";
import {
  readSurveyOptions,
  readSurveyFilesOptions,
  updateSurveyMutation,
  readJobOptions,
} from "@/client/@tanstack/react-query.gen";
import { generateFileDownloadUrl } from "@/client/sdk.gen";
import { formatDate } from "@/lib/utils";
import type { FileRead } from "@/client/types.gen";

// Weather display helper
const getWeatherDisplay = (weather: string | null | undefined) => {
  if (!weather) return null;
  const weatherMap: Record<string, string> = {
    sunny: "☀️ Sunny",
    partly_cloudy: "⛅ Partly Cloudy",
    cloudy: "☁️ Cloudy",
    overcast: "🌥️ Overcast",
    light_rain: "🌦️ Light Rain",
    rain: "🌧️ Rain",
    heavy_rain: "🌧️ Heavy Rain",
    showers: "🚿 Showers",
    drizzle: "💧 Drizzle",
    thunderstorm: "⛈️ Thunderstorm",
    snow: "❄️ Snow",
    sleet: "🌨️ Sleet",
    hail: "🧊 Hail",
    fog: "🌫️ Fog",
    mist: "🌁 Mist",
    windy: "💨 Windy",
    clear: "🌙 Clear",
    frost: "🥶 Frost",
    hot: "🔥 Hot",
    cold: "🥶 Cold",
  };
  return weatherMap[weather.toLowerCase()] || weather;
};

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  const { id } = use(params);
  const surveyId = parseInt(id, 10);
  const queryClient = useQueryClient();

  const [isEditingSiteNotes, setIsEditingSiteNotes] = useState(false);
  const [editedSiteNotes, setEditedSiteNotes] = useState("");

  // Fetch survey data
  const { data: survey, isLoading: isSurveyLoading } = useQuery({
    ...readSurveyOptions({ path: { survey_id: surveyId } }),
    enabled: !isNaN(surveyId),
  });

  // Fetch survey files
  const { data: files = [], isLoading: isFilesLoading } = useQuery({
    ...readSurveyFilesOptions({ path: { survey_id: surveyId } }),
    enabled: !isNaN(surveyId),
  });

  // Fetch job for navigation context
  const { data: job } = useQuery({
    ...readJobOptions({ path: { job_id: survey?.job_id || 0 } }),
    enabled: !!survey?.job_id,
  });

  // Update mutation
  const { mutate: updateSurvey, isPending: isUpdating } = useMutation({
    ...updateSurveyMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readSurveyOptions({ path: { survey_id: surveyId } }).queryKey,
      });
      setIsEditingSiteNotes(false);
    },
  });

  // Helper function to get download URL
  const getDownloadUrl = async (fileId: number): Promise<string> => {
    const response = await generateFileDownloadUrl({
      path: { file_id: fileId },
      throwOnError: true,
    });
    return response.data;
  };

  // Separate images and other files
  const imageFiles = files.filter((f: FileRead) =>
    f.mime_type.startsWith("image/")
  );
  const otherFiles = files.filter(
    (f: FileRead) => !f.mime_type.startsWith("image/")
  );

  // Prepare images for lightbox
  const [imageUrls, setImageUrls] = useState<
    { id: number | string; url: string; fileName?: string }[]
  >([]);
  const lightbox = useLightbox(imageUrls);

  // Generate download URLs for images when they load
  const handleImageClick = async (file: FileRead, index: number) => {
    // Generate URLs for all images if not already done
    if (imageUrls.length === 0) {
      const urls = await Promise.all(
        imageFiles.map(async (f: FileRead) => {
          const url = await getDownloadUrl(f.id);
          return {
            id: f.id,
            url,
            fileName: f.file_name,
          };
        })
      );
      setImageUrls(urls);
      // Open lightbox after URLs are ready
      setTimeout(() => lightbox.openLightbox(index), 100);
    } else {
      lightbox.openLightbox(index);
    }
  };

  const handleDownloadFile = async (file: FileRead) => {
    const url = await getDownloadUrl(file.id);
    window.open(url, "_blank");
  };

  const handleSaveSiteNotes = () => {
    updateSurvey({
      path: { survey_id: surveyId },
      body: { site_notes: editedSiteNotes },
    });
  };

  const handleStartEditingSiteNotes = () => {
    setEditedSiteNotes(survey?.site_notes || "");
    setIsEditingSiteNotes(true);
  };

  if (isSurveyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Survey not found</p>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/app/jobs/${survey.job_id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">
            Survey - {formatDate(survey.conducted_date)}
          </h1>
          {job && (
            <p className="text-muted-foreground">
              <Link
                href={`/app/jobs/${job.id}`}
                className="hover:underline"
              >
                {job.name}
              </Link>
              {job.client && ` • ${job.client.name}`}
            </p>
          )}
        </div>
      </div>

      {/* Main content - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Survey details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Survey Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(survey.conducted_date)}</p>
                </div>
              </div>

              {/* Weather */}
              {survey.weather && (
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weather</p>
                    <p className="font-medium">
                      {getWeatherDisplay(survey.weather)}
                    </p>
                  </div>
                </div>
              )}

              {/* Surveyors */}
              {((survey.surveyors && survey.surveyors.length > 0) ||
                survey.conducted_by_user) && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Surveyors</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {survey.surveyors && survey.surveyors.length > 0 ? (
                        survey.surveyors.map((s) => (
                          <Badge key={s.id} variant="secondary">
                            {s.name}
                          </Badge>
                        ))
                      ) : survey.conducted_by_user ? (
                        <Badge variant="secondary">
                          {survey.conducted_by_user.name}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Instruction */}
              {survey.instruction && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instruction</p>
                    <p className="font-medium">{survey.instruction.name}</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold">{survey.photo_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Photos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">{survey.file_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          {survey.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{survey.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Site Notes Card - with inline editing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Site Notes</CardTitle>
              {!isEditingSiteNotes && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartEditingSiteNotes}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingSiteNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedSiteNotes}
                    onChange={(e) => setEditedSiteNotes(e.target.value)}
                    rows={6}
                    className="resize-none"
                    placeholder="Add site observations..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingSiteNotes(false)}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSiteNotes}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Spinner className="h-4 w-4 mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {survey.site_notes || "No site notes recorded."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Files Card */}
          {otherFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {otherFiles.map((file: FileRead) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm truncate flex-1">
                      {file.file_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Image gallery */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Survey Photos
                <Badge variant="secondary" className="ml-auto">
                  {imageFiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isFilesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : imageFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                  <p>No photos attached to this survey</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imageFiles.map((file: FileRead, index: number) => (
                    <ImageThumbnail
                      key={file.id}
                      file={file}
                      onClick={() => handleImageClick(file, index)}
                      getDownloadUrl={getDownloadUrl}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={imageUrls}
        initialIndex={lightbox.initialIndex}
        open={lightbox.isOpen}
        onOpenChange={lightbox.setIsOpen}
      />
    </div>
  );
}

// Image thumbnail component with lazy loading
function ImageThumbnail({
  file,
  onClick,
  getDownloadUrl,
}: {
  file: FileRead;
  onClick: () => void;
  getDownloadUrl: (fileId: number) => Promise<string>;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load image URL on mount
  useState(() => {
    getDownloadUrl(file.id)
      .then((url) => {
        setImageUrl(url);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  });

  return (
    <button
      onClick={onClick}
      className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={file.file_name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </button>
  );
}
