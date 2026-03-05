"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Camera,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  createSurveyMutation,
  readSurveysOptions,
  readOrgOptions,
  generateFileUploadUrlsMutation,
  createFilesMutation,
  readJobOptions,
} from "@/client/@tanstack/react-query.gen";
import {
  type SurveyCreate,
  type FilePresignRequest,
  type FileCreate,
} from "@/client/types.gen";
import { uploadFilesToS3 } from "@/lib/upload";

// Weather options with display labels
const weatherOptions: { value: string; label: string }[] = [
  { value: "sunny", label: "☀️ Sunny" },
  { value: "partly_cloudy", label: "⛅ Partly Cloudy" },
  { value: "cloudy", label: "☁️ Cloudy" },
  { value: "overcast", label: "🌥️ Overcast" },
  { value: "light_rain", label: "🌦️ Light Rain" },
  { value: "rain", label: "🌧️ Rain" },
  { value: "heavy_rain", label: "🌧️ Heavy Rain" },
  { value: "showers", label: "🚿 Showers" },
  { value: "drizzle", label: "💧 Drizzle" },
  { value: "thunderstorm", label: "⛈️ Thunderstorm" },
  { value: "snow", label: "❄️ Snow" },
  { value: "sleet", label: "🌨️ Sleet" },
  { value: "hail", label: "🧊 Hail" },
  { value: "fog", label: "🌫️ Fog" },
  { value: "mist", label: "🌁 Mist" },
  { value: "windy", label: "💨 Windy" },
  { value: "clear", label: "🌙 Clear" },
  { value: "frost", label: "🥶 Frost" },
  { value: "hot", label: "🔥 Hot" },
  { value: "cold", label: "🥶 Cold" },
];

const formSchema = z.object({
  conducted_date: z.string().min(1, "Please select a date"),
  description: z.string().optional(),
  site_notes: z.string().optional(),
  weather: z.string().optional().nullable(),
  surveyor_ids: z.array(z.number()).optional(),
});

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

interface CreateSurveyDialogProps {
  jobId: number;
  instructionId?: number;
  trigger?: React.ReactNode;
}

export function CreateSurveyDialog({
  jobId,
  instructionId,
  trigger,
}: CreateSurveyDialogProps) {
  const [open, setOpen] = useState(false);
  const [surveyorOpen, setSurveyorOpen] = useState(false);
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState<number[]>([]);
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [otherFiles, setOtherFiles] = useState<FileWithPreview[]>([]);
  const [siteNotesFile, setSiteNotesFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const siteNotesInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch org users for surveyor selection
  const { data: orgData } = useQuery({
    ...readOrgOptions(),
  });

  const orgUsers = orgData?.users || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conducted_date: new Date().toISOString().split("T")[0],
      description: "",
      site_notes: "",
      weather: null,
      surveyor_ids: [],
    },
  });

  const { mutateAsync: createSurveyAsync, isPending: isSurveyPending } =
    useMutation({
      ...createSurveyMutation(),
    });

  const { mutateAsync: generateUploadUrls } = useMutation({
    ...generateFileUploadUrlsMutation(),
  });

  const { mutateAsync: createFiles } = useMutation({
    ...createFilesMutation(),
  });

  // Handle drag and drop for images
  const handleImageDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const items = e.dataTransfer.items;
      const newFiles: FileWithPreview[] = [];

      const processEntry = async (entry: FileSystemEntry) => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          return new Promise<File>((resolve) => {
            fileEntry.file((file) => resolve(file));
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const reader = dirEntry.createReader();
          return new Promise<File[]>((resolve) => {
            reader.readEntries(async (entries) => {
              const files: File[] = [];
              for (const subEntry of entries) {
                const result = await processEntry(subEntry);
                if (Array.isArray(result)) {
                  files.push(...result);
                } else if (result) {
                  files.push(result);
                }
              }
              resolve(files);
            });
          });
        }
        return null;
      };

      const processItems = async () => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item) continue;
          const entry = item.webkitGetAsEntry();
          if (entry) {
            const result = await processEntry(entry);
            if (Array.isArray(result)) {
              result.forEach((file) => {
                if (file.type.startsWith("image/")) {
                  newFiles.push({
                    file,
                    id: `${file.name}-${Date.now()}-${i}`,
                    preview: URL.createObjectURL(file),
                  });
                }
              });
            } else if (result && result.type.startsWith("image/")) {
              newFiles.push({
                file: result,
                id: `${result.name}-${Date.now()}-${i}`,
                preview: URL.createObjectURL(result),
              });
            }
          }
        }
        setImageFiles((prev) => [...prev, ...newFiles]);
      };

      processItems();
    },
    []
  );

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFilesToAdd = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file, i) => ({
        file,
        id: `${file.name}-${Date.now()}-${i}`,
        preview: URL.createObjectURL(file),
      }));
    setImageFiles((prev) => [...prev, ...imageFilesToAdd]);
  };

  const handleOtherFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filesToAdd = files.map((file, i) => ({
      file,
      id: `${file.name}-${Date.now()}-${i}`,
    }));
    setOtherFiles((prev) => [...prev, ...filesToAdd]);
  };

  const handleSiteNotesFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a text file we can extract from
    const validTypes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt",
      ".docx",
    ];
    const isValid =
      validTypes.some((type) => file.type.includes(type)) ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".docx");

    if (isValid) {
      setSiteNotesFile(file);
      // For .txt files, we can read directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        form.setValue("site_notes", text);
      } else {
        // For .docx files, we would need server-side processing
        // For now, just set the file and user can manually input notes
        form.setValue(
          "site_notes",
          `[Content from ${file.name} will be extracted]`
        );
      }
    }
  };

  const removeImage = (id: string) => {
    setImageFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const removeFile = (id: string) => {
    setOtherFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeSiteNotesFile = () => {
    setSiteNotesFile(null);
    form.setValue("site_notes", "");
  };

  const toggleSurveyor = (userId: number) => {
    setSelectedSurveyorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Create the survey first
      const surveyData: SurveyCreate = {
        job_id: jobId,
        instruction_id: instructionId || null,
        conducted_date: values.conducted_date,
        description: values.description || null,
        site_notes: values.site_notes || null,
        weather: values.weather || null,
        surveyor_ids:
          selectedSurveyorIds.length > 0 ? selectedSurveyorIds : null,
        conducted_by_user_id:
          selectedSurveyorIds.length > 0 ? selectedSurveyorIds[0] : user.id,
      };

      const survey = await createSurveyAsync({ body: surveyData });
      setUploadProgress(10);

      // 2. If there are files, upload them
      const allFiles = [...imageFiles, ...otherFiles];
      if (allFiles.length > 0) {
        // Generate presigned URLs
        const presignRequests: FilePresignRequest[] = allFiles.map(
          (fw, index) => ({
            file_name: fw.file.name,
            mime_type: fw.file.type || "application/octet-stream",
            size_bytes: fw.file.size,
            client_id: `${index}`,
          })
        );

        const presignedUrls = await generateUploadUrls({
          body: presignRequests,
        });
        setUploadProgress(30);

        // Upload files to S3 - extract the raw File objects
        const rawFiles = allFiles.map((fw) => fw.file);
        await uploadFilesToS3(rawFiles, presignedUrls, (progress) => {
          setUploadProgress(30 + progress * 0.5);
        });
        setUploadProgress(80);

        // Create file records with survey_id
        const fileCreates: FileCreate[] = presignedUrls.map((presigned) => ({
          file_name: presigned.file_name,
          mime_type: presigned.mime_type,
          size_bytes: presigned.size_bytes || 0,
          storage_key: presigned.storage_key,
          org_id: user.org_id!,
          uploaded_by_user_id: user.id,
          job_id: jobId,
          survey_id: survey.id,
        }));

        await createFiles({ body: fileCreates });
      }

      setUploadProgress(100);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: readSurveysOptions({ query: { job_id: jobId } }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      });

      // Reset form and close dialog
      setOpen(false);
      form.reset();
      setSelectedSurveyorIds([]);
      setImageFiles([]);
      setOtherFiles([]);
      setSiteNotesFile(null);

      // Navigate to the new survey's detail page
      router.push(`/app/surveys/${survey.id}`);
    } catch (error) {
      console.error("Failed to create survey:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const isPending = isSurveyPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Add Survey
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Survey</DialogTitle>
          <DialogDescription>
            Record a site survey visit with photos, notes, and observations.
          </DialogDescription>
        </DialogHeader>
        <div className="pr-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pb-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Survey Date */}
                <FormField
                  control={form.control}
                  name="conducted_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weather */}
                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weather" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weatherOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Surveyors Multi-select */}
              <div className="space-y-2">
                <FormLabel>Surveyors</FormLabel>
                <Popover open={surveyorOpen} onOpenChange={setSurveyorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={surveyorOpen}
                      className="w-full justify-between"
                    >
                      {selectedSurveyorIds.length > 0
                        ? `${selectedSurveyorIds.length} surveyor(s) selected`
                        : "Select surveyors..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search team members..." />
                      <CommandList>
                        <CommandEmpty>No team members found.</CommandEmpty>
                        <CommandGroup>
                          {orgUsers.map((u) => (
                            <CommandItem
                              key={u.id}
                              value={u.name}
                              onSelect={() => toggleSurveyor(u.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSurveyorIds.includes(u.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {u.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedSurveyorIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSurveyorIds.map((id) => {
                      const user = orgUsers.find((u) => u.id === id);
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleSurveyor(id)}
                        >
                          {user?.name}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the survey purpose..."
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Site Notes with File Upload Option */}
              <FormField
                control={form.control}
                name="site_notes"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Site Notes (Optional)</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={() => siteNotesInputRef.current?.click()}
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        Upload .txt/.docx
                      </Button>
                      <input
                        ref={siteNotesInputRef}
                        type="file"
                        accept=".txt,.docx"
                        className="hidden"
                        onChange={handleSiteNotesFileSelect}
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed observations from the site survey..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    {siteNotesFile && (
                      <FormDescription className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Imported from: {siteNotesFile.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-muted-foreground hover:text-destructive"
                          onClick={removeSiteNotesFile}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload - Drag & Drop */}
              <div className="space-y-2">
                <FormLabel>Survey Photos</FormLabel>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images or folders, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, HEIC, and other image formats
                  </p>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageFileSelect}
                />

                {/* Image Previews */}
                {imageFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} selected
                    </p>
                    <div className="max-h-[180px] overflow-y-auto border rounded-md p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {imageFiles.map((fw) => (
                          <div key={fw.id} className="relative group">
                            {fw.preview && (
                              <img
                                src={fw.preview}
                                alt={fw.file.name}
                                className="w-full h-20 object-cover rounded"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(fw.id)}
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Files Upload */}
              <div className="space-y-2">
                <FormLabel>Additional Files (Optional)</FormLabel>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">
                    Click to add PDFs, documents, or other files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleOtherFilesSelect}
                />

                {/* File List */}
                {otherFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {otherFiles.length} file{otherFiles.length !== 1 ? "s" : ""} selected
                    </p>
                    <div className="max-h-[120px] overflow-y-auto border rounded-md p-2 space-y-1">
                      {otherFiles.map((fw) => (
                        <div
                          key={fw.id}
                          className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{fw.file.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(fw.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading
              ? "Uploading..."
              : imageFiles.length > 0 || otherFiles.length > 0
              ? `Create Survey (${imageFiles.length + otherFiles.length} files)`
              : "Create Survey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
