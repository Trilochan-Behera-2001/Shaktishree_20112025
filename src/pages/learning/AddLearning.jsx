import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  CardContent,
  MenuItem,
  IconButton,
  Dialog,
  DialogContent,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  MdAdd,
  MdDelete,
  MdPlayCircleOutline,
  MdUploadFile,
} from "react-icons/md";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { encryptPayload } from "../../crypto/encryption";
import MuiSelect from "@mui/material/Select";
import {
  getaddlearndropdownandlist,
  saveaddlearning,
  editaddlearning,
  statusaddlearning,
  viewDocumentAdd,
} from "../../services/LearningTypeService";
// import { getAllTraning } from "../../services/AllTraning";
import ActionButtons from "../../components/common/ActionButtons";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ReusableDialog from "../../components/common/ReusableDialog";
import Loader from "../../components/common/Loader";
import CardHeading from "../../components/common/CardHeading";

const learningSchema = yup.object().shape({
  learnTypeId: yup.object().nullable().required("Type of Training is required"),
  title: yup.string().required("Title is required"),
  createdBy: yup.string().required("Created by is required"),
  fromDate: yup
    .mixed()
    .required("From date is required")
    .test("is-valid-date", "From date is required", (value) => {
      return value !== null && dayjs(value).isValid();
    }),
  endDate: yup
    .mixed()
    .required("End date is required")
    .test("is-valid-date", "End date is required", (value) => {
      return value !== null && dayjs(value).isValid();
    })
    .test(
      "is-after-from-date",
      "End date must be after from date",
      function (value) {
        const fromDate = this.parent.fromDate;
        if (!fromDate || !value) return true;
        return dayjs(value).startOf('day').isAfter(dayjs(fromDate).startOf('day'));
      }
    ),
  description: yup.string().required("Description is required"),
  titleImages: yup
    .mixed()
    .required("Title image is required")
    .test("fileType", "Only images are allowed", (value) => {
      if (!value) return false;
      const files = Array.isArray(value) ? value : [value];
      return files.every((file) => {
        if (file.mediaPath && !file.type) {
          return true;
        }

        return (
          file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
        );
      });
    })
    .test("fileSize", "File size must be less than 2MB", (value) => {
      if (!value) return false;
      const files = Array.isArray(value) ? value : [value];
      return files.every((file) => {
        if (file.mediaPath && !file.size) {
          return true;
        }

        return file && file.size <= 2000000;
      });
    }),
});

const AddLearning = () => {
  const [videos, setVideos] = useState([]);
  const [openVideo, setOpenVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningTypes, setLearningTypes] = useState([]);
  const [Language, setLanguage] = useState([]);
  const [learningTable, setLearningTable] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState({});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(learningSchema),
    defaultValues: {
      learnTypeId: null,
      type: "",
      title: "",
      createdBy: "",
      fromDate: null,
      endDate: null,
      description: "",
      titleImages: [],
    },
  });

  const fetchLearningTypes = async () => {
    setTableLoading(true);
    try {
      const res = await getaddlearndropdownandlist();
      setLearningTypes(res?.data?.data?.trainingTypeList || []);
      setLanguage(res?.data?.data?.languageList || []);
      setLearningTable(res?.data?.data?.trainingList || []);
    } catch {
      setLearningTypes([]);
      toast.error("Failed to fetch learning types");
    } finally {
      setTableLoading(false);
    }
  };
  useEffect(() => {
    fetchLearningTypes();
  }, []);

  // const [allData, setAllData] = useState();

  const handleEdit = async () => {
    if (!rowToEdit) return;
    setIsSubmitting(true);
    setLoading(true);
    setOpenConfirm(false);

    try {
      const encrypted = encryptPayload(rowToEdit.learnId);
      const res = await editaddlearning(encrypted);

      const data = res.data?.data;

      // setAllData(data);
      if (!data || !data.training) {
        toast.error("No training details found");
        return;
      }

      const training = data.training;

      let learningTypeOption = null;

      if (
        typeof training.learningTypeId === "object" &&
        training.learningTypeId !== null
      ) {
        learningTypeOption = {
          value: training.learningTypeId.learnTypeId,
          label: training.learningTypeId.learnTypeName,
        };
      } else {
        const found = data.trainingTypeList?.find(
          (t) => t.learnTypeId === training.learningTypeId
        );
        if (found) {
          learningTypeOption = {
            value: found.learnTypeId,
            label: found.learnTypeName,
          };
        }
      }

      reset({
        learnTypeId: learningTypeOption,
        title: training.learningName || "",
        createdBy: training.createdBy || "",
        // Fix date parsing to avoid timezone issues
        fromDate: training.startDate
          ? dayjs(training.startDate, "DD/MM/YYYY").startOf('day')
          : null,
        endDate: training.endDate
          ? dayjs(training.endDate, "DD/MM/YYYY").startOf('day')
          : null,
        description: training.description || "",
        titleImages: training.learningTitleImage
          ? [
            {
              name:
                training.learningTitleImage.split("/").pop() ||
                training.learningTitleImage,
              mediaPath: training.learningTitleImage,
            },
          ]
          : [],
      });

      const safeVideos = Array.isArray(training.videos)
        ? training.videos.map((v) => ({
          title: v.videoTitle || "",
          videoId: v.videoId || null,
          videoLanguages: Array.isArray(v.videoLanguages)
            ? v.videoLanguages.map((lang) => ({
              languageId: lang.languageId || "",
              videoPath: null,
              videoDbPath: lang.videoDbPath || "",
              languageTitle: lang.languageTitle || "",
            }))
            : [],
          languages: [],
          questions: Array.isArray(v.questions)
            ? v.questions.map((q) => ({
              questionId: q.questionId || "",
              title: q.questiontitle || "",
              mark: q.marks || "",
              options: Array.isArray(q.options)
                ? q.options.map((o) => ({
                  optionId: o.optionId || "",
                  text: o.optionValue || "",
                  isCorrect: !!o.isCorrect,
                }))
                : [],
              correctAnswer: q.options?.findIndex((o) => o.isCorrect) ?? -1,
            }))
            : [],
        }))
        : [];

      setVideos(safeVideos);

      toast.success("Learning details loaded for edit");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch learning details");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  const handleCancel = () => {
    reset({
      learnTypeId: null,
      title: "",
      createdBy: "",
      fromDate: null,
      endDate: null,
      description: "",
      titleImages: [],
    });
    setVideos([]);
    setRowToEdit(null);
    setOpenConfirm(false);
  };

  const formData = watch();

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["allTraining"],
  //   queryFn: async () => {
  //     const res = await getAllTraning();
  //     return res.data;
  //   },
  // });

  const handleChange = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const addVideo = () => {
    setVideos([...videos, { title: "", languages: [], questions: [] }]);
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const addLanguage = (vIndex) => {
    const newVideos = [...videos];

    const isEditMode =
      newVideos[vIndex].videoLanguages &&
      newVideos[vIndex].videoLanguages.length > 0;
    const languagesArray = isEditMode
      ? newVideos[vIndex].videoLanguages
      : newVideos[vIndex].languages;

    const lastLang = languagesArray?.at(-1);

    if (
      lastLang &&
      ((isEditMode && !lastLang.languageId) ||
        (!isEditMode && (!lastLang.lang || !lastLang.file)))
    ) {
      toast.error(
        `Please complete the previous language before adding a new one`
      );
      return;
    }

    if (isEditMode) {
      newVideos[vIndex].videoLanguages.push({
        languageId: "",
        videoPath: null,
        videoDbPath: "",
        languageTitle: "",
      });
    } else {
      newVideos[vIndex].languages.push({ lang: "", file: null });
    }

    setVideos(newVideos);
  };

  const removeLanguage = (vIndex, lIndex) => {
    const newVideos = [...videos];

    const isEditMode =
      newVideos[vIndex].videoLanguages &&
      newVideos[vIndex].videoLanguages.length > 0;

    if (isEditMode) {
      newVideos[vIndex].videoLanguages.splice(lIndex, 1);
    } else {
      newVideos[vIndex].languages.splice(lIndex, 1);
    }

    setVideos(newVideos);
  };

  const addQuestion = (vIndex) => {
    const newVideos = [...videos];
    const lastQ = newVideos[vIndex].questions.at(-1);

    if (
      lastQ &&
      (!lastQ.title.trim() || !lastQ.mark || lastQ.options.length === 0)
    ) {
      toast.error(
        `Please complete the previous question before adding a new one`
      );
      return;
    }

    newVideos[vIndex].questions.push({
      title: "",
      mark: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: null,
    });
    setVideos(newVideos);
  };

  const removeQuestion = (vIndex, qIndex) => {
    const newVideos = [...videos];
    newVideos[vIndex].questions.splice(qIndex, 1);
    setVideos(newVideos);
  };



  const handleCorrectAnswerChange = (vIndex, qIndex, oIndex) => {
    const newVideos = [...videos];
    newVideos[vIndex].questions[qIndex].correctAnswer = oIndex;
    setVideos(newVideos);
  };

  const validateVideos = () => {
    if (videos.length === 0) {
      toast.error("Please add at least one video");
      return false;
    }

    for (let vIndex = 0; vIndex < videos.length; vIndex++) {
      const video = videos[vIndex];

      if (!video.title || !video.title.trim()) {
        toast.error(`Please enter video title for Video ${vIndex + 1}`);
        return false;
      }

      const isEditMode =
        video.videoLanguages && video.videoLanguages.length > 0;
      const languagesArray = isEditMode
        ? video.videoLanguages
        : video.languages;

      if (languagesArray.length === 0) {
        toast.error(`Please add at least one language for Video ${vIndex + 1}`);
        return false;
      }

      for (let lIndex = 0; lIndex < languagesArray.length; lIndex++) {
        const language = languagesArray[lIndex];

        if (isEditMode) {
          if (!language.languageId && !language.videoDbPath) {
            toast.error(`Please select language for Video ${vIndex + 1}`);
            return false;
          }

          // Validate new file if one is selected, regardless of existing videoDbPath
          if (language.videoPath) {
            if (
              ![
                "video/mp4",
                "video/webm",
                "video/avi",
                "video/quicktime",
              ].includes(language.videoPath.type)
            ) {
              toast.error(
                `Invalid file type for Video ${vIndex + 1
                }. Please use MP4, WebM, or AVI files.`
              );
              return false;
            }

            if (language.videoPath.size > 2 * 1024 * 1024) {
              toast.error(
                `Video file too large for Video ${vIndex + 1
                }. Maximum size is 2MB.`
              );
              return false;
            }
          }
        } else {
          if (!language.lang) {
            toast.error(`Please select language for Video ${vIndex + 1}`);
            return false;
          }

          if (!language.file) {
            toast.error(`Please upload video file for Video ${vIndex + 1}`);
            return false;
          }

          if (
            language.file &&
            ![
              "video/mp4",
              "video/webm",
              "video/avi",
              "video/quicktime",
            ].includes(language.file.type)
          ) {
            toast.error(
              `Invalid file type for Video ${vIndex + 1
              }. Please use MP4, WebM, or AVI files.`
            );
            return false;
          }

          if (language.file && language.file.size > 2 * 1024 * 1024) {
            toast.error(
              `Video file too large for Video ${vIndex + 1
              }. Maximum size is 2MB.`
            );
            return false;
          }
        }
      }

      for (let qIndex = 0; qIndex < video.questions.length; qIndex++) {
        const question = video.questions[qIndex];

        if (!question.title || !question.title.trim()) {
          toast.error(
            `Please enter question title for Question ${qIndex + 1} in Video ${vIndex + 1
            }`
          );
          return false;
        }

        if (
          !question.mark ||
          isNaN(question.mark) ||
          !/^\d$/.test(question.mark.toString()) ||
          parseInt(question.mark) <= 0
        ) {
          toast.error(
            `Please enter valid marks (single digit positive number only) for Question ${qIndex + 1
            } in Video ${vIndex + 1}`
          );
          return false;
        }

        if (question.options.length !== 4) {
          toast.error(
            `Please add exactly 4 options for Question ${qIndex + 1} in Video ${vIndex + 1
            }`
          );
          return false;
        }

        let hasCorrectAnswer = false;
        let emptyOptions = false;

        for (let oIndex = 0; oIndex < question.options.length; oIndex++) {
          const option = question.options[oIndex];

          if (!option.text || !option.text.trim()) {
            toast.error(
              `Please enter option text for Option ${oIndex + 1} in Question ${qIndex + 1
              }`
            );
            emptyOptions = true;
            return false;
          }

          if (question.correctAnswer === oIndex) {
            hasCorrectAnswer = true;
          }
        }

        if (emptyOptions) return false;

        if (!hasCorrectAnswer) {
          toast.error(
            `Please select correct answer for Question ${qIndex + 1} in Video ${vIndex + 1
            }`
          );
          return false;
        }
      }
    }

    return true;
  };

  const toggleStatus = async (learnId) => {
    setStatusLoading(true);
    try {
      const payload = encryptPayload(learnId);

      const res = await statusaddlearning(payload);

      if (res.data?.outcome) {
        toast.success(res.data?.message || "Status updated successfully");

        if (res.data?.data?.trainingList) {
          setLearningTable(res.data.data.trainingList);
        }
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("toggleStatus error:", err);
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
      await fetchLearningTypes();
    }
  };

  const onSubmit = async (data) => {
    if (!validateVideos()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    const formData = new FormData();

    const isEditMode = rowToEdit && rowToEdit.learningCode;

    if (isEditMode) {
      const encryptedId = rowToEdit.learningCode;
      formData.append("learningCode", encryptedId);
      console.log("Encrypted learnId added:", encryptedId);
    }
    // formData.append("learningCode", rowToEdit.learningCode || null)

    formData.append("learningName", data.title);
    formData.append("createdBy", data.createdBy);
    // Fix date formatting to avoid timezone issues
    formData.append("startDate", dayjs(data.fromDate).startOf('day').format("DD/MM/YYYY"));
    formData.append("endDate", dayjs(data.endDate).startOf('day').format("DD/MM/YYYY"));
    formData.append("description", data.description);

    if (data.learnTypeId) {
      if (typeof data.learnTypeId === "object" && data.learnTypeId.value) {
        formData.append("learningTypeId", data.learnTypeId.value);
      } else if (typeof data.learnTypeId === "number") {
        formData.append("learningTypeId", data.learnTypeId);
      }
    }

    if (data.titleImages?.length > 0) {
      data.titleImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("imagePath", file || rowToEdit.learningTitleImage);
        }
      });
    }

    videos.forEach((video, vIndex) => {
      formData.append(`videos[${vIndex}].videoTitle`, video.title);
      formData.append(`videos[${vIndex}].videoId`, video.videoId || "");

      if (video.videoLanguages && Array.isArray(video.videoLanguages)) {
        video.videoLanguages.forEach((lang, lIndex) => {
          formData.append(
            `videos[${vIndex}].videoLanguages[${lIndex}].languageId`,
            lang.languageId || ""
          );

          // Send new file if selected, otherwise send existing path
          if (lang.videoPath && lang.videoPath instanceof File) {
            formData.append(
              `videos[${vIndex}].videoLanguages[${lIndex}].videoPath`,
              lang.videoPath
            );
          } else if (lang.videoDbPath) {
            formData.append(
              `videos[${vIndex}].videoLanguages[${lIndex}].videoDbPath`,
              lang.videoDbPath
            );
          }
        });
      }

      

      if (video.languages && Array.isArray(video.languages)) {
        video.languages.forEach((lang, lIndex) => {
          const languageObj = Language.find((l) => l.languageId === lang.lang);
          if (languageObj) {
            formData.append(
              `videos[${vIndex}].videoLanguages[${lIndex}].languageId`,
              languageObj.languageId
            );
          }

          if (lang.file && lang.file instanceof File) {
            formData.append(
              `videos[${vIndex}].videoLanguages[${lIndex}].videoPath`,
              lang.file
            );
          }
        });
      }

      video.questions.forEach((q, qIndex) => {
        formData.append(
          `videos[${vIndex}].questions[${qIndex}].questiontitle`,
          q.title
        );
        formData.append(
          `videos[${vIndex}].questions[${qIndex}].marks`,
          q.mark || q.marks || ""
        );
        formData.append(
          `videos[${vIndex}].questions[${qIndex}].questionId`,
          q.questionId || ""
        );

        q.options.forEach((opt, oIndex) => {
          formData.append(
            `videos[${vIndex}].questions[${qIndex}].options[${oIndex}].optionValue`,
            opt.text
          );
          formData.append(
            `videos[${vIndex}].questions[${qIndex}].options[${oIndex}].isCorrect`,
            q.correctAnswer === oIndex ? "true" : "false"
          );
          formData.append(
            `videos[${vIndex}].questions[${qIndex}].options[${oIndex}].optionId`,
            opt.optionId || ""
          );
        });
      });
    });

    try {
      const res = await saveaddlearning(formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.outcome) {
        toast.success(
          res.data?.message ||
          (isEditMode
            ? "Learning content updated successfully!"
            : "Learning content submitted successfully!")
        );
        reset({
          learnTypeId: null,
          title: "",
          createdBy: "",
          fromDate: null,
          endDate: null,
          description: "",
          titleImages: [],
        });
        setVideos([]);
        setRowToEdit(null);
        setOpenConfirm(false);
        await fetchLearningTypes();
      } else {
        toast.error(
          res.data?.message ||
          (isEditMode ? "Error updating form" : "Error submitting form")
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(isEditMode ? "Update failed" : "Submission failed");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleVideoView = async (videoPath) => {
    try {

      if (videoPath instanceof File) {
        const url = URL.createObjectURL(videoPath);
        setOpenVideo(url);
        return;
      }

      const res = await viewDocumentAdd(null, {
        params: {
          moduleName: "LEARNING_MNGMNT",
          filePath: videoPath,
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setOpenVideo(url);
    } catch (err) {
      console.error("Error viewing video:", err);
      toast.error("Failed to play video.");
    }
  };

  const handleMarkChange = (vIndex, qIndex, value) => {
    if (value === "" || /^\d$/.test(value)) {
      const newVideos = [...videos];
      newVideos[vIndex].questions[qIndex].mark = value;
      setVideos(newVideos);
    }
  };

  const filteredLearning = (learningTable || []).filter(
    (row) =>
      (row?.learnTypeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.learnName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (row?.createdBy || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (row?.description || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedLearning = filteredLearning.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const learningColumns = [
    {
      name: "Sl. No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Learning Type",
      selector: (row) => row.learnTypeId?.learnTypeName || "-",
      sortable: true,
    },
    {
      name: "Learning Name",
      selector: (row) => row.learnName,
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row) => row.createdBy,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) =>
        row.startDate ? dayjs(row.startDate).startOf('day').format("DD/MM/YYYY") : "-",
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) =>
        row.endDate ? dayjs(row.endDate).startOf('day').format("DD/MM/YYYY") : "-",
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onEdit={() => {
            setRowToEdit(row);
            setOpenConfirm(true);
          }}
          onToggleStatus={() => toggleStatus(row.learnId)}
          editDisabled={!row.isActive}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,

      center: true,
    },
  ];

  return (
    <>
      <Loader loading={loading || tableLoading || statusLoading} />
      <Box
        sx={{
          p: 3,
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <CardContent sx={{ p: 1}}>
              {/* Header Section */}
              <Box
                
              >
                <CardHeading props={'Add Training'} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "error.main",
                  }}
                >
                  
                </Box>
              </Box>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Type of Learning */}
                <div>
                  <Controller
                    name="learnTypeId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={(learningTypes || []).map((t) => ({
                          value: t.learnTypeId,
                          label: t.learnTypeName,
                        }))}
                        placeholder={
                          <span>
                            Select Type <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        isSearchable
                        value={field.value}
                        onChange={(selected) => field.onChange(selected)}
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor: "#fff",
                            minHeight: "42px",
                            borderColor: errors.learnTypeId ? "#d32f2f" : "#ccc",
                            boxShadow: errors.learnTypeId ? "0 0 0 2px rgba(211, 47, 47, 0.2)" : "none",
                            "&:hover": {
                              borderColor: errors.learnTypeId ? "#d32f2f" : "#999"
                            },
                            zIndex: 2,
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                            backgroundColor: isSelected
                              ? "#1976d2"
                              : isFocused
                                ? "#e3f2fd"
                                : "#fff",
                            color: isSelected ? "#fff" : "#000",
                            cursor: "pointer",
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.learnTypeId && (
                    <div style={{
                      color: '#d32f2f',
                      fontSize: '0.75rem',
                      marginTop: '3px',
                      marginLeft: '14px',
                      fontWeight: '400',
                      minHeight: '16px'
                    }}>
                      {errors.learnTypeId.message}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label={
                          <>
                            Title <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        // value={}
                        // onChange={(e)}
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                      />
                    )}
                  />
                </div>

                {/* Created By */}
                <div>
                  <Controller
                    name="createdBy"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label={
                          <>
                            Created By <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!errors.createdBy}
                        helperText={errors.createdBy?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                      />
                    )}
                  />
                </div>

                {/* From Date */}
                <div>
                  <Controller
                    name="fromDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label={
                            <>
                              From Date <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          disablePast
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: !!errors.fromDate,
                              helperText: errors.fromDate?.message,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </div>

                {/* End Date */}
                <div>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label={
                            <>
                              End Date <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          minDate={formData.fromDate}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </div>

                {/* Title Image Upload - File names inside the button */}
                <div className="flex gap-2 items-center">
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<MdUploadFile />}
                    size="small"
                    style={{
                      fontSize: "11px",
                      height: "40px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    color={errors.titleImages ? "error" : "primary"}
                  >
                    {formData.titleImages && formData.titleImages.length > 0
                      ? formData.titleImages
                        .map(
                          (file, index) =>
                            file.name ||
                            (file.mediaPath
                              ? file.mediaPath.split("/").pop()
                              : `image${index + 1}`)
                        )
                        .join(", ")
                      : "Upload Title Images *"}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        setValue("titleImages", Array.from(e.target.files));
                      }}
                    />
                  </Button>

                  {/* Show remove all button */}
                  {formData.titleImages && formData.titleImages.length > 0 && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleChange("titleImages", [])}
                      sx={{ ml: 1 }}
                      style={{ height: "fit-content" }}
                    >
                      <MdDelete />
                    </IconButton>
                  )}
                </div>

                {/* Description Full Width */}
                <div className=" mt-1">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label={
                          <>
                            Description <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        multiline
                        rows={1}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Video Section Header with Add Button */}
              <Box sx={{ mt: 6, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "rgb(155 0 80)",
                      fontSize: "1.2rem",
                      borderBottom: "2px solid rgb(155 0 80)",
                      paddingBottom: "5px",
                      width: "fit-content",
                      // margin: "0 0 16px 0",
                    }}
                  >
                    Videos
                  </h2>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MdAdd />}
                    onClick={addVideo}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Add Video
                  </Button>
                </Box>
              </Box>

              {/* Videos List */}
              {(videos || []).map((video, vIndex) => (
                <div
                  key={vIndex}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {/* Video Header - Inline with Title and Delete Button */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "0.4fr 1fr auto",
                      gap: 2,
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <>
                          Video Title <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      value={video.title}
                      onChange={(e) => {
                        const newVideos = [...videos];
                        newVideos[vIndex].title = e.target.value;
                        setVideos(newVideos);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    {/* Add Language Button */}
                    <Button
                      variant="contained"
                      startIcon={<MdAdd />}
                      onClick={() => addLanguage(vIndex)}
                      sx={{ borderRadius: 2, width: "280px" }}
                    >
                      Add Language & File
                    </Button>
                    <Button
                      color="error"
                      variant="contained"
                      size="small"
                      onClick={() => removeVideo(vIndex)}
                      sx={{
                        borderRadius: 2,
                        minWidth: "auto",
                        padding: "6px 10px",
                        marginRight: "8px",
                        px: 2,
                      }}
                    >
                      <MdDelete size={18} />
                    </Button>
                  </Box>

                  {/* Languages Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      Video Files
                    </Typography>

                    {/* Existing Language Files */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "5px 10px",
                        alignItems: "center",
                      }}
                    >
                      {/* Handle both edit mode (videoLanguages) and create mode (languages) */}
                      {(video.videoLanguages || video.languages || []).map(
                        (lang, lIndex) => {
                          // Determine which language structure we're using
                          const isEditMode =
                            video.videoLanguages &&
                            video.videoLanguages.length > 0;
                          const languageId = isEditMode
                            ? lang.languageId
                            : lang.lang;
                          const languageName = isEditMode
                            ? Language.find(
                              (l) => l.languageId === lang.languageId
                            )?.languageName || ""
                            : Language.find((l) => l.languageId === lang.lang)
                              ?.languageName || "";
                          // Show new file name if selected, otherwise show existing file name
                          const fileName = isEditMode
                            ? lang.videoPath
                              ? lang.videoPath.name
                              : lang.videoDbPath
                                ? lang.videoDbPath.split("/").pop()
                                : ""
                            : lang.file
                              ? lang.file.name
                              : "";

                          return (
                            <Box
                              key={lIndex}
                              sx={{
                                display: "flex",
                                justifyContent: "start",
                                gap: 2,
                                alignItems: "center",
                                mb: 1,
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {isEditMode ? (
                                // Edit mode - display language name as read-only if it exists
                                languageId ? (
                                  <TextField
                                    size="small"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        width: "180px",
                                      },
                                    }}
                                    label="Language"
                                    value={languageName}
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                  />
                                ) : (
                                  // Edit mode but adding new language - allow selection
                                  <TextField
                                    select
                                    size="small"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        width: "180px",
                                      },
                                    }}
                                    label={
                                      <>
                                        Select Language{" "}
                                        <span style={{ color: "red" }}>*</span>
                                      </>
                                    }
                                    value={languageId || ""}
                                    onChange={(e) => {
                                      const newVideos = [...videos];
                                      newVideos[vIndex].videoLanguages[
                                        lIndex
                                      ].languageId = e.target.value;
                                      setVideos(newVideos);
                                    }}
                                  >
                                    {Language.map((langOption) => (
                                      <MenuItem
                                        key={langOption.languageId}
                                        value={langOption.languageId}
                                      >
                                        {langOption.languageName}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )
                              ) : (
                                // Create mode - allow language selection
                                <Controller
                                  name="languageId"
                                  control={control}
                                  rules={{ required: true }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      select
                                      size="small"
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 2,
                                          width: "180px",
                                        },
                                      }}
                                      label={
                                        <>
                                          Select Language{" "}
                                          <span style={{ color: "red" }}>
                                            *
                                          </span>
                                        </>
                                      }
                                      value={lang.lang || ""}
                                      onChange={(e) => {
                                        const newVideos = [...videos];
                                        newVideos[vIndex].languages[
                                          lIndex
                                        ].lang = e.target.value;
                                        setVideos(newVideos);
                                      }}
                                    >
                                      {Language.map((langOption) => (
                                        <MenuItem
                                          key={langOption.languageId}
                                          value={langOption.languageId}
                                        >
                                          {langOption.languageName}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />
                              )}

                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<MdUploadFile />}
                                size="small"
                                sx={{
                                  height: "40px",
                                  borderRadius: 2,
                                  justifyContent: "flex-start",
                                  textTransform: "none",
                                  width: "220px",
                                  overflow: "hidden",
                                }}
                              >
                                {fileName || "Choose video file..."}
                                {/* Show upload progress if available */}
                                {lang.uploadProgress && (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      marginLeft: "5px",
                                    }}
                                  >
                                    {lang.uploadProgress}%
                                  </div>
                                )}
                                {/* Allow file upload in both modes - users should be able to replace existing files */}
                                <input
                                  hidden
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    const newVideos = [...videos];
                                    if (isEditMode) {
                                      newVideos[vIndex].videoLanguages[
                                        lIndex
                                      ].videoPath = e.target.files[0];
                                    } else {
                                      newVideos[vIndex].languages[lIndex].file =
                                        e.target.files[0];
                                    }
                                    setVideos(newVideos);
                                  }}
                                />
                              </Button>
                              <div style={{ textAlign: "right" }}>
                                {/* Play button - show for both edit mode with existing video and create mode with selected file */}
                                {(isEditMode &&
                                  (lang.videoDbPath || lang.videoPath)) ||
                                  (!isEditMode && lang.file) ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      if (isEditMode) {
                                        handleVideoView(
                                          lang.videoPath || lang.videoDbPath
                                        );
                                      } else if (!isEditMode && lang.file) {
                                        handleVideoView(lang.file);
                                      }
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      minWidth: "auto",
                                      padding: "6px 10px",
                                      marginRight: "8px",
                                      px: 2,
                                    }}
                                  >
                                    <MdPlayCircleOutline size={18} />
                                  </Button>
                                ) : null}

                                {/* Remove button */}
                                <Button
                                  color="error"
                                  variant="contained"
                                  size="small"
                                  onClick={() => removeLanguage(vIndex, lIndex)}
                                  sx={{
                                    borderRadius: 2,
                                    minWidth: "auto",
                                    padding: "6px 10px",
                                    marginRight: "8px",
                                    px: 2,
                                  }}
                                >
                                  <MdDelete size={18} />
                                </Button>
                              </div>
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  </Box>

                  {/* Questions Section */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Questions
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<MdAdd />}
                        size="small"
                        onClick={() => addQuestion(vIndex)}
                        sx={{ borderRadius: 2 }}
                      >
                        Add Question
                      </Button>
                    </Box>

                    {video.questions.map((q, qIndex) => (
                      <div
                        key={qIndex}
                        sx={{
                          mt: 2,
                          p: 3,
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            Question {qIndex + 1}
                          </Typography>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => removeQuestion(vIndex, qIndex)}
                            sx={{
                              borderRadius: 2,
                              minWidth: "auto",
                              padding: "6px 10px",
                              marginRight: "8px",
                              px: 2,
                            }}
                          >
                            <MdDelete size={18} />
                          </Button>
                        </Box>

                        <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                          <Grid item xs={12} md={8}>
                            <TextField
                              fullWidth
                              size="small"
                              label={
                                <>
                                  Question Title{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </>
                              }
                              value={q.title}
                              onChange={(e) => {
                                const newVideos = [...videos];
                                newVideos[vIndex].questions[qIndex].title =
                                  e.target.value;
                                setVideos(newVideos);
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label={
                                <>
                                  Marks <span style={{ color: "red" }}>*</span>
                                </>
                              }
                              value={q.mark}
                              onChange={(e) =>
                                handleMarkChange(vIndex, qIndex, e.target.value)
                              }
                              inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                        </Grid>

                        {/* Options Grid - 4 items per row */}
                        <FormControl
                          component="fieldset"
                          sx={{ width: "100%" }}
                        >
                          <FormLabel component="legend" sx={{ mb: 2 }}>
                            Options (Select Correct Answer)<span style={{ color: "red" }}>*</span> 
                          </FormLabel>
                          <Grid container spacing={2}>
                            {q.options.map((opt, oIndex) => (
                              <Grid item xs={12} sm={6} md={3} key={oIndex}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: "1px solid #e2e8f0",
                                    backgroundColor:
                                      q.correctAnswer === oIndex
                                        ? "#dbeafe"
                                        : "transparent",
                                  }}
                                >
                                  <Radio
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() =>
                                      handleCorrectAnswerChange(
                                        vIndex,
                                        qIndex,
                                        oIndex
                                      )
                                    }
                                    size="small"
                                  />
                                  <TextField
                                    size="small"
                                    placeholder={`Option ${oIndex + 1} `}
                                    value={opt.text}
                                    onChange={(e) => {
                                      const newVideos = [...videos];
                                      newVideos[vIndex].questions[
                                        qIndex
                                      ].options[oIndex].text = e.target.value;
                                      setVideos(newVideos);
                                    }}
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </FormControl>

                        {/* Removed Add Option Button since we want to keep exactly 4 options */}
                      </div>
                    ))}
                  </Box>
                </div>
              ))}

              {/* Submit Button */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2, px: 2, py: 1 }}
                >
                  {rowToEdit
                    ? "Update"
                    : isSubmitting
                      ? "Submitting..."
                      : "Submit"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  sx={{ borderRadius: 2, px: 2, py: 1 }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </div>
        </form>

        {/* Video Modal */}
        <Dialog
          open={!!openVideo}
          onClose={() => {
            // Revoke the object URL to free memory when closing the dialog
            if (openVideo) {
              URL.revokeObjectURL(openVideo);
            }
            setOpenVideo(null);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogContent sx={{ p: 0 }}>
            {openVideo && (
              <video
                width="100%"
                height="auto"
                controls
                autoPlay
                style={{ borderRadius: "8px" }}
                src={openVideo} // ✅ Now it's a full URL
              >
                Your browser does not support the video tag.
              </video>
            )}
          </DialogContent>
        </Dialog>
      </Box>

      <Box
        sx={{
          p: 3,
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      >
        <CardHeading props={'List of Training Activity'} />
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            marginBottom: 16,
          }}
        >
          
          <TextField
            size="small"
            placeholder="Search..."
            value={searchText}
            autoComplete="off"
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <ReusableDataTable
          data={paginatedLearning}
          columns={learningColumns}
          page={page}
          rowsPerPage={rowsPerPage}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}
            >
              Rows per page:
            </Typography>
            <MuiSelect
              size="small"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                width: 80,
                height: 35,
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                "& .MuiSelect-select": {
                  padding: "6px 12px",
                },
                "& fieldset": {
                  borderColor: "#1976d2",
                },
                "&:hover fieldset": {
                  borderColor: "#115293",
                },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </MuiSelect>
          </div>

          <Pagination
            count={Math.ceil(filteredLearning.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            variant="outlined"
            color="primary"
            size="medium"
          />
        </div>
      </Box>
      <ReusableDialog
        open={openConfirm}
        title={rowToEdit ? "Confirm Edit" : "Confirm Add"}
        description={
          rowToEdit
            ? "Are you sure you want to edit this training?"
            : "Are you sure you want to add this training?"
        }
        onClose={() => setOpenConfirm(false)}
        onConfirm={rowToEdit ? handleEdit : handleSubmit(onSubmit)}
        disableBackdropClick={true}
      />
    </>
  );
};

export default AddLearning;
