// ConfigPanel.tsx - Configuration Panel Component

import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  X,
  UserPlus,
  ImageIcon,
  Video,
  FileAudio,
  FileIcon,
} from "lucide-react";
import { BuilderNodeData, Template, Member } from "./types";
import { FileUploadButton } from "./FileUploadButton";
import { uid } from "./utils";

interface ConfigPanelProps {
  selected: Node<BuilderNodeData> | null;
  onChange: (patch: Partial<BuilderNodeData>) => void;
  onDelete: () => void;
  templates: Template[];
  members: Member[];
}

export function ConfigPanel({
  selected,
  onChange,
  onDelete,
  templates,
  members,
}: ConfigPanelProps) {

  console.log("ConfigPanel members:", members);
  
  if (!selected || selected.data.kind === "start") {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a node to configure
      </div>
    );
  }

  const d = selected.data;

  const handleFileUpload =
    (type: "image" | "video" | "audio" | "document") => (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      onChange({
        [`${type}File`]: file,
        [`${type}Preview`]: previewUrl,
      } as any);
    };

  const removeFile = (type: "image" | "video" | "audio" | "document") => () => {
    onChange({
      [`${type}File`]: null,
      [`${type}Preview`]: null,
    } as any);
  };

  const addButton = () => {
    const newButton = {
      id: uid(),
      text: "New Button",
      action: "next" as const,
    };
    onChange({
      buttons: [...(d.buttons || []), newButton],
    });
  };

  const updateButton = (
    buttonId: string,
    updates: Partial<NonNullable<typeof d.buttons>[0]>
  ) => {
    onChange({
      buttons: (d.buttons || []).map((btn) =>
        btn.id === buttonId ? { ...btn, ...updates } : btn
      ),
    });
  };

  const removeButton = (buttonId: string) => {
    onChange({
      buttons: (d.buttons || []).filter((btn) => btn.id !== buttonId),
    });
  };

  const addKeyword = () => {
    const keywords = d.keywords || [];
    onChange({
      keywords: [...keywords, ""],
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const keywords = d.keywords || [];
    const updated = [...keywords];
    updated[index] = value;
    onChange({
      keywords: updated,
    });
  };

  const removeKeyword = (index: number) => {
    const keywords = d.keywords || [];
    onChange({
      keywords: keywords.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col h-screen mt-4">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Configure
              </div>
              <div className="text-lg font-semibold">{d.label}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {d.kind === "conditions" && (
            <Card className="p-3 space-y-4">
              <div>
                <Label>Condition Type</Label>
                <Select
                  value={d.conditionType || "keyword"}
                  onValueChange={(value) =>
                    onChange({ conditionType: value as any })
                  }
                >
                  <SelectTrigger className="w-full h-9 px-2 text-sm">
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Contains Keywords</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="starts_with">Starts With</SelectItem>
                    <SelectItem value="contains">Contains Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Match Type</Label>
                <Select
                  value={d.matchType || "any"}
                  onValueChange={(value) =>
                    onChange({ matchType: value as any })
                  }
                >
                  <SelectTrigger className="w-full h-9 px-2 text-sm">
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Match Any</SelectItem>
                    <SelectItem value="all">Match All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Keywords</Label>
                  <Button size="sm" variant="outline" onClick={addKeyword}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Keyword
                  </Button>
                </div>

                {(d.keywords || []).map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={keyword}
                      onChange={(e) => updateKeyword(index, e.target.value)}
                      placeholder={`Keyword ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeKeyword(index)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {(!d.keywords || d.keywords.length === 0) && (
                  <div className="text-sm text-gray-500 italic">
                    No keywords added yet. Click "Add Keyword" to start.
                  </div>
                )}
              </div>
            </Card>
          )}

          {d.kind === "custom_reply" && (
            <Card className="p-3 space-y-4">
              <div>
                <Label>Message</Label>
                <Textarea
                  rows={4}
                  value={d.message || ""}
                  onChange={(e) => onChange({ message: e.target.value })}
                  placeholder="Hi {{name}},&#10;&#10;Welcome to Product Academy, please share the following information before we proceed."
                />
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-500 text-white border-green-500 hover:bg-green-600"
                  >
                    Variables
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Attachments</Label>
                <div className="grid grid-cols-2 gap-2">
                  <FileUploadButton
                    accept="image/*"
                    onUpload={handleFileUpload("image")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </FileUploadButton>
                  <FileUploadButton
                    accept="video/*"
                    onUpload={handleFileUpload("video")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </FileUploadButton>
                  <FileUploadButton
                    accept="audio/*"
                    onUpload={handleFileUpload("audio")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileAudio className="w-4 h-4" />
                    Audio
                  </FileUploadButton>
                  <FileUploadButton
                    accept=".pdf,.doc,.docx,.txt"
                    onUpload={handleFileUpload("document")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileIcon className="w-4 h-4" />
                    Document
                  </FileUploadButton>
                </div>

                {d.imagePreview && (
                  <div className="relative border rounded-lg p-2">
                    <img
                      src={d.imagePreview}
                      alt="preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={removeFile("image")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {d.videoPreview && (
                  <div className="relative border rounded-lg p-2 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Video file attached</span>
                    <button
                      onClick={removeFile("video")}
                      className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {d.audioPreview && (
                  <div className="relative border rounded-lg p-2 flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">Audio file attached</span>
                    <button
                      onClick={removeFile("audio")}
                      className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {d.documentPreview && (
                  <div className="relative border rounded-lg p-2 flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">Document attached</span>
                    <button
                      onClick={removeFile("document")}
                      className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Buttons (Optional)</Label>
                  <Button size="sm" variant="outline" onClick={addButton}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Button
                  </Button>
                </div>

                {d.buttons?.map((button) => (
                  <div
                    key={button.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={button.text}
                        onChange={(e) =>
                          updateButton(button.id, { text: e.target.value })
                        }
                        placeholder="Button text"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeButton(button.id)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {d.kind === "time_gap" && (
            <Card className="p-3 space-y-3">
              <div>
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  min={10}
                  value={d.delay ?? 60}
                  onChange={(e) =>
                    onChange({ delay: parseInt(e.target.value, 10) })
                  }
                />
              </div>
            </Card>
          )}

          {d.kind === "send_template" && (
            <Card className="p-3 space-y-3">
              <div>
                <Label>Choose Template</Label>
                <select
                  className="w-full border rounded-md h-9 px-2"
                  value={d.templateId || ""}
                  onChange={(e) => onChange({ templateId: e.target.value })}
                >
                  <option value="">Select template</option>
                  {templates?.map((t: Template) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {d.kind === "assign_user" && (
            <Card className="p-3 space-y-3">
              <div>
                <Label className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Assign to Member
                </Label>
                <select
                  className="w-full border rounded-md h-9 px-2"
                  value={d.assigneeId || ""}
                  onChange={(e) => onChange({ assigneeId: e.target.value })}
                >
                  <option value="">Select member</option>
                  {members.map((m: Member) => (
                    <option key={m.id} value={m.id}>
                      {m.name || `${m.firstName || ""} ${m.lastName || ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {d.kind === "user_reply" && (
            <Card className="p-3 space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  rows={4}
                  value={d.question || ""}
                  onChange={(e) => onChange({ question: e.target.value })}
                  placeholder="What would you like to ask the user?"
                />
              </div>

              <div>
                <Label>Save Answer As (Variable Name)</Label>
                <Input
                  value={d.saveAs || ""}
                  onChange={(e) => onChange({ saveAs: e.target.value })}
                  placeholder="e.g., user_name, phone_number"
                />
              </div>

              <div className="space-y-3">
                <Label>Attachments (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <FileUploadButton
                    accept="image/*"
                    onUpload={handleFileUpload("image")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </FileUploadButton>
                  <FileUploadButton
                    accept="video/*"
                    onUpload={handleFileUpload("video")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </FileUploadButton>
                </div>

                {d.imagePreview && (
                  <div className="relative border rounded-lg p-2">
                    <img
                      src={d.imagePreview}
                      alt="preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={removeFile("image")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {d.videoPreview && (
                  <div className="relative border rounded-lg p-2 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Video file attached</span>
                    <button
                      onClick={removeFile("video")}
                      className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button size="sm" variant="outline" onClick={addButton}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                {d.buttons?.map((button) => (
                  <div
                    key={button.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={button.text}
                        onChange={(e) =>
                          updateButton(button.id, { text: e.target.value })
                        }
                        placeholder="Answer option text"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeButton(button.id)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <select
                        value={button.action || "next"}
                        onChange={(e) =>
                          updateButton(button.id, {
                            action: e.target.value as "next" | "custom",
                          })
                        }
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option value="next">Continue to next step</option>
                        <option value="custom">Custom action</option>
                      </select>

                      {button.action === "custom" && (
                        <Input
                          value={button.value || ""}
                          onChange={(e) =>
                            updateButton(button.id, { value: e.target.value })
                          }
                          placeholder="Custom value"
                          className="flex-1 text-xs h-7"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {(!d.buttons || d.buttons.length === 0) && (
                  <div className="text-sm text-gray-500 italic border rounded-lg p-4 text-center">
                    No answer options added. Users will be able to type free
                    text responses.
                    <br />
                    <br />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addButton}
                      className="mt-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add First Option
                    </Button>
                  </div>
                )}
              </div>

              {(d.question || (d.buttons && d.buttons.length > 0)) && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-gray-500">PREVIEW</Label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    {d.question && (
                      <div className="font-medium text-sm mb-3">
                        {d.question}
                      </div>
                    )}
                    {d.buttons && d.buttons.length > 0 && (
                      <div className="space-y-1">
                        {d.buttons.map((button) => (
                          <div
                            key={button.id}
                            className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full inline-block mr-2"
                          >
                            {button.text}
                          </div>
                        ))}
                      </div>
                    )}
                    {(!d.buttons || d.buttons.length === 0) && (
                      <div className="text-xs text-gray-500 italic">
                        [User can type free text response]
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}