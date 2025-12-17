import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Type,
  Image,
  Video,
  FileText,
  Plus,
  Trash2,
  MessageSquare,
  Hash,
  Link,
  Phone,
  Smartphone,
} from "lucide-react";
import type { Template } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";

// Template form schema
const templateFormSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(512, "Template name must be less than 512 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Only lowercase letters, numbers, and underscores allowed"
    ),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().default("en_US"),
  mediaType: z.enum(["text", "image", "video", "document"]).default("text"),
  mediaUrl: z.string().optional(),
  header: z
    .string()
    .max(60, "Header must be less than 60 characters")
    .optional()
    .default(""),
  body: z
    .string()
    .min(1, "Message body is required")
    .max(1024, "Body must be less than 1024 characters"),
  footer: z
    .string()
    .max(60, "Footer must be less than 60 characters")
    .optional()
    .default(""),
  buttons: z
    .array(
      z.object({
        type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
        text: z
          .string()
          .min(1)
          .max(20, "Button text must be less than 20 characters"),
        url: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
    )
    .max(3, "Maximum 3 buttons allowed")
    .default([]),
  variables: z.array(z.string()).default([]),
  samples: z.array(z.string()).default([]),
  mediaFile: z.any().optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
  onSubmit: (data: TemplateFormData) => void;
  isSubmitting?: boolean;
}

export function TemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isSubmitting = false,
}: TemplateDialogProps) {
  const { user } = useAuth();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      category: "MARKETING",
      language: "en_US",
      mediaType: "text",
      mediaUrl: "",
      mediaFile: undefined,
      header: "",
      body: "",
      footer: "",
      buttons: [],
      variables: [],
    },
  });

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control: form.control,
    name: "buttons",
  });

  // useEffect(() => {
  //   if (template) {
  //     const headerComponent = template.components?.find(
  //       (c) => c.type === "HEADER"
  //     );
  //     const bodyComponent = template.components?.find((c) => c.type === "BODY");
  //     const footerComponent = template.components?.find(
  //       (c) => c.type === "FOOTER"
  //     );
  //     const buttonComponent = template.components?.find(
  //       (c) => c.type === "BUTTONS"
  //     );

  //     form.reset({
  //       name: template.name,
  //       category: template.category as any,
  //       language: template.language || "en_US",
  //       mediaType:
  //         headerComponent?.format === "IMAGE"
  //           ? "image"
  //           : headerComponent?.format === "VIDEO"
  //           ? "video"
  //           : headerComponent?.format === "DOCUMENT"
  //           ? "document"
  //           : "text",
  //       mediaUrl: "",
  //       header:
  //         headerComponent?.format === "TEXT"
  //           ? headerComponent.text || template.header || ""
  //           : "",
  //       body: bodyComponent?.text || template.body,
  //       footer: footerComponent?.text || template.footer || "",
  //       buttons:
  //         buttonComponent?.buttons?.map((btn: any) => ({
  //           type: btn.type,
  //           text: btn.text,
  //           url: btn.url || "",
  //           phoneNumber: btn.phone_number || "",
  //         })) || [],
  //       variables: [],
  //     });
  //   } else {
  //     form.reset({
  //       name: "",
  //       category: "MARKETING",
  //       language: "en_US",
  //       mediaType: "text",
  //       mediaUrl: "",
  //       header: "",
  //       body: "",
  //       footer: "",
  //       buttons: [],
  //       variables: [],
  //     });
  //   }
  // }, [template, form]);



  useEffect(() => {
  if (template) {
    const headerComponent = template.components?.find(c => c.type === "HEADER");
    const bodyComponent = template.components?.find(c => c.type === "BODY");
    const footerComponent = template.components?.find(c => c.type === "FOOTER");
    const buttonComponent = template.components?.find(c => c.type === "BUTTONS");

    // Extract placeholder numbers from body text
    const extractVariables = (text = "") => {
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      // Extract unique numbers, sort ascending
      return Array.from(
        new Set(matches.map(m => Number(m.replace(/[{}]/g, ""))))
      ).sort((a, b) => a - b);
    };

    const variablesFromBody = extractVariables(bodyComponent?.text || "");

    // If you have saved sample values on template (e.g. template.samples), use them; else empty string
    const samplesFromTemplate = template.samples || [];

    // Create variables array of sample values matching placeholders
    const variables = variablesFromBody.map((num, i) =>
      typeof samplesFromTemplate[i] === "string" ? samplesFromTemplate[i] : ""
    );

    form.reset({
      name: template.name,
      category: template.category as any,
      language: template.language || "en_US",
      mediaType:
        headerComponent?.format === "IMAGE"
          ? "image"
          : headerComponent?.format === "VIDEO"
          ? "video"
          : headerComponent?.format === "DOCUMENT"
          ? "document"
          : "text",
      mediaUrl: "",
      header:
        headerComponent?.format === "TEXT"
          ? headerComponent.text || template.header || ""
          : "",
      body: bodyComponent?.text || template.body,
      footer: footerComponent?.text || template.footer || "",
      buttons:
        buttonComponent?.buttons?.map((btn: any) => ({
          type: btn.type,
          text: btn.text,
          url: btn.url || "",
          phoneNumber: btn.phone_number || "",
        })) || [],
      variables,
    });
  } else {
    form.reset({
      name: "",
      category: "MARKETING",
      language: "en_US",
      mediaType: "text",
      mediaUrl: "",
      header: "",
      body: "",
      footer: "",
      buttons: [],
      variables: [],
    });
  }
}, [template, form]);


  const extractVariables = (text: string) => {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = [...new Set([...text.matchAll(regex)].map((m) => m[1]))];
    return matches;
  };


  


  const handleAddButton = () => {
    if (buttonFields.length < 3) {
      appendButton({ type: "QUICK_REPLY", text: "", url: "", phoneNumber: "" });
    }
  };

  const handleSubmit = (data: TemplateFormData) => {
    onSubmit(data);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const watchedValues = form.watch();

//   useEffect(() => {
//   const vars = extractVariables(watchedValues.body || "");

//   const existing = form.getValues("variables") || [];

//   if (vars.length !== existing.length) {
//     form.setValue(
//       "variables",
//       vars.map((_, i) => existing[i] ?? "")
//     );
//   }
// }, [watchedValues.body]);

useEffect(() => {
  const vars = extractVariables(watchedValues.body || "");

  form.setValue(
    "variables",
    vars.map(() => "")
  );
}, [watchedValues.body]);

useEffect(() => {
  if (watchedValues.mediaType !== "text") {
    form.setValue("header", "");
  }
}, [watchedValues.mediaType]);



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <DialogDescription>
            Create WhatsApp message templates for marketing, utility, or
            authentication purposes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Left side - Form */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-4 space-y-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-700">
                    Basic Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="welcome_message"
                            {...field}
                            disabled={!!template}
                          />
                        </FormControl>
                        <FormDescription>
                          Use lowercase letters, numbers, and underscores only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!!template}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MARKETING">Marketing</SelectItem>
                              <SelectItem value="UTILITY">Utility</SelectItem>
                              <SelectItem value="AUTHENTICATION">
                                Authentication
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!!template}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en_US">English (US)</SelectItem>
                              <SelectItem value="en_GB">English (UK)</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                              <SelectItem value="ar">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-gray-700">
                    Template Content
                  </h3>

                  <FormField
                    control={form.control}
                    name="mediaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">
                              <div className="flex items-center">
                                <Type className="w-4 h-4 mr-2" />
                                Text Only
                              </div>
                            </SelectItem>
                            <SelectItem value="image">
                              <div className="flex items-center">
                                <Image className="w-4 h-4 mr-2" />
                                Image
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center">
                                <Video className="w-4 h-4 mr-2" />
                                Video
                              </div>
                            </SelectItem>
                            <SelectItem value="document">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Document
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* {watchedValues.mediaType !== "text" && (
                    <FormField
                      control={form.control}
                      name="mediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sample Media URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a sample URL for preview purposes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )} */}

                  {watchedValues.mediaType !== "text" && (
  <FormField
    control={form.control}
    name="mediaFile"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Upload Media</FormLabel>
        <FormControl>
          <input
            type="file"
            accept={
              watchedValues.mediaType === "image"
                ? "image/*"
                : watchedValues.mediaType === "video"
                ? "video/*"
                : watchedValues.mediaType === "document"
                ? ".pdf,.doc,.docx,.txt"
                : "*/*"
            }
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              field.onChange(file);

              if (file && watchedValues.mediaType === "image") {
                // Show image preview
                const reader = new FileReader();
                reader.onload = () => {
                  form.setValue("mediaUrl", reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </FormControl>
        <FormDescription>
          Upload an image, video, or document based on media type.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)}


                  {/* Header */}
                  {watchedValues.mediaType === "text" && (
  <FormField
    control={form.control}
    name="header"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Header (Optional)</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              placeholder="Optional header text (max 60 chars)"
              maxLength={60}
              {...field}
            />
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                (field.value?.length || 0) >= 60
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {field.value?.length || 0} / 60
            </span>
          </div>
        </FormControl>
        <FormDescription>
          Max 60 characters. Avoid emojis and “STOP” messages.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)}

                  {/* Body */}
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Hi {{1}}, welcome to our service! Your account has been created successfully."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{{1}}"}, {"{{2}}"}, etc. for variables. Max 1024
                          characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Footer */}
                  <FormField
                    control={form.control}
                    name="footer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="Reply STOP to unsubscribe" {...field} />
                            <span
                              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                                (field.value?.length || 0) > 60
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {field.value?.length || 0} / 60
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>Max 60 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Variables */}
                  {extractVariables(watchedValues.body).length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm font-medium">
                        Sample Values for Variables
                      </Label>
                      {extractVariables(watchedValues.body).map((variable, idx) => (
                        <FormField
                          key={variable}
                          control={form.control}
                          name={`variables.${idx}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value for {`{{${variable}}}`}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`Sample value for {{${variable}}}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Preview with sample values */}
                  <div className="pt-4">
                    <Label className="text-sm font-medium">
                      Preview with Sample Values
                    </Label>
                    <p className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      {watchedValues.body?.replace(/\{\{(\d+)\}\}/g, (_, n) => {
                        const value = watchedValues.variables?.[Number(n) - 1];
                        return typeof value === "string" ? value : `{{${n}}}`;
                      }) || "Template body will appear here..."}
                    </p>
                  </div>

                  {/* Detected Variables */}
                  {watchedValues.body &&
                    extractVariables(watchedValues.body).length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Detected Variables
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {extractVariables(watchedValues.body).map((variable) => (
                            <Badge key={variable} variant="secondary">
                              <Hash className="w-3 h-3 mr-1" />
                              Variable {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Buttons Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-gray-700">Action Buttons</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddButton}
                      disabled={buttonFields.length >= 3}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Button
                    </Button>
                  </div>

                  {buttonFields.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No buttons added. Click "Add Button" to create action buttons.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {buttonFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <Label>Button {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeButton(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`buttons.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Button Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="QUICK_REPLY">
                                      <div className="flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Quick Reply
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="URL">
                                      <div className="flex items-center">
                                        <Link className="w-4 h-4 mr-2" />
                                        URL
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="PHONE_NUMBER">
                                      <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Phone Number
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`buttons.${index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Button Text</FormLabel>
                                <FormControl>
                                  <Input placeholder="Click me" {...field} />
                                </FormControl>
                                <FormDescription>Max 20 characters</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {watchedValues.buttons?.[index]?.type === "URL" && (
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.url`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com/{{1}}"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    You can use variables like {"{{1}}"} in URLs
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {watchedValues.buttons?.[index]?.type === "PHONE_NUMBER" && (
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.phoneNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1234567890" {...field} />
                                  </FormControl>
                                  <FormDescription>Include country code</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Preview */}
              <div className="bg-gray-50 rounded-lg p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-medium">WhatsApp Preview</span>
                  {getMediaIcon(watchedValues.mediaType)}
                </div>

                <div className="bg-white rounded-lg shadow-sm max-w-sm mx-auto">
                  {/* Header Media */}
                  {/* {watchedValues.mediaType !== "text" && (
                    <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center">
                      {getMediaIcon(watchedValues.mediaType)}
                    </div>
                  )} */}

                  {watchedValues.mediaType !== "text" && (
  <div className="bg-gray-200 h-48 rounded-t-lg overflow-hidden flex items-center justify-center">
   {watchedValues.mediaType === "image" && watchedValues.mediaUrl ? (
  <img
    src={watchedValues.mediaUrl}
    alt="Preview"
    className="w-full h-full object-cover"
  />
) : (
  <div className="flex flex-col items-center text-gray-500">
    {getMediaIcon(watchedValues.mediaType)}
    <span className="text-xs mt-1">Media Preview</span>
  </div>
)}

  </div>
)}


                  <div className="p-4 space-y-2">
                    {watchedValues.header && (
                      <h3 className="font-semibold text-base">
                        {watchedValues.header}
                      </h3>
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {watchedValues.body || "Template body will appear here..."}
                    </p>
                    {watchedValues.footer && (
                      <p className="text-xs text-gray-500 pt-2">{watchedValues.footer}</p>
                    )}
                    {watchedValues.buttons &&
                      watchedValues.buttons.length > 0 && (
                        <div className="pt-3 space-y-2">
                          {watchedValues.buttons.map((button, idx) => (
                            <button
                              key={idx}
                              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                            >
                              {button.text || "Button text"}
                              {button.type === "URL" && " →"}
                              {button.type === "PHONE_NUMBER" && " 📞"}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Template Guidelines
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Template names must be unique and lowercase</li>
                      <li>• Marketing templates require explicit opt-in</li>
                      <li>
                        • Variables are replaced with actual values when sending
                      </li>
                      <li>
                        • Templates must be approved by WhatsApp before use
                      </li>
                    </ul>
                  </div>

                  {watchedValues.category === "MARKETING" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-900 mb-2">
                        Marketing Template Notice
                      </h4>
                      <p className="text-xs text-amber-800">
                        Marketing templates can only be sent to users who have
                        opted in to receive promotional messages. Ensure you
                        have proper consent before sending.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={user?.username === "demouser" ? true : isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : template
                  ? "Update Template"
                  : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
