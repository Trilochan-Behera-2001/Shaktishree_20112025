import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Radio,
  FormControl,
  FormLabel,
  IconButton,
  Pagination,
  MenuItem,
  InputAdornment,
  Select as MuiSelect,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MdAdd, MdDelete } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ReusableDialog from "../../components/common/ReusableDialog";
import ActionButtons from "../../components/common/ActionButtons";
import {
  questiondropdownandlist,
  checkcategorylistpresent,
  
  savequestionpaper,
  editquestionpaper
} from "../../services/categoryService";
import CardHeading from "../../components/common/CardHeading";
import { encryptPayload } from "../../crypto/encryption";

const learningSchema = yup.object().shape({
  categoryId: yup.object().nullable().required("Type of category is required"),
});

const AddQuestionPaper = () => {
  const [categorylist, setCategorylist] = useState([]);
  const [categoryTable, setCategoryTable] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(learningSchema),
    defaultValues: {
      categoryId: null,
    },
  });

  const fetchCategoryList = async () => {
    setIsLoading(true);
    try {
      const res = await questiondropdownandlist();
      console.log("response of dropdown", res);
      setCategorylist(res?.data?.data?.categoryList || []);
      setCategoryTable(res?.data?.data?.questionList || []);
    } catch {
      toast.error("Failed to fetch category data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const handleCategoryChange = async (selectedOption, onChange) => {
    
    if (isEdit) {
      onChange(selectedOption);
      return;
    }
    
    onChange(selectedOption);
    
    if (!selectedOption?.value) return;
   setIsLoading(true);
    try {
      const encrypted = encryptPayload(selectedOption.value);
      const res = await checkcategorylistpresent(encrypted);

      if (res?.data?.outcome === true) {
        toast.info(
          res?.data?.message || "This category is already mapped with a question."
        );
        onChange(null);
      }
    } catch  {
      
      toast.error("Failed to check category");
    }finally{
       setIsLoading(false);
    }
  };

const addQuestion = () => {
  if (questions.length > 0) {
    const lastQ = questions[questions.length - 1];

   
    if (!lastQ.title || !lastQ.title.trim()) {
      toast.error("Please enter the question title before adding a new question");
      return;
    }

  
    const emptyOption = lastQ.options.find((opt) => !opt.text || !opt.text.trim());
    if (emptyOption) {
      toast.error("Please fill all options before adding a new question");
      return;
    }

    
    if (lastQ.correctAnswer === null || lastQ.correctAnswer === undefined) {
      toast.error("Please select the correct answer before adding a new question");
      return;
    }
  }

  
  setQuestions([
    ...questions,
    {
      questionId: null,
      title: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: null,
    },
  ]);
};


  const removeQuestion = (qIndex) => {
    const newList = [...questions];
    newList.splice(qIndex, 1);
    setQuestions(newList);
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const newList = [...questions];
    newList[qIndex].correctAnswer = oIndex;
    setQuestions(newList);
  };

  const handleEdit = (row) => {
    setRowToEdit(row);
    setOpenConfirm(true);
  };

  const handleConfirmEdit = async () => {
    if (!rowToEdit) return;
    setIsLoading(true);
    setOpenConfirm(false);
    try {
      const encrypted = encryptPayload(rowToEdit.categoryId);
      const res = await editquestionpaper(encrypted);
      
      if (res?.data?.outcome === true) {
        const data = res.data.data.categoryQuestion;
        
        console.log("Edit response data:", data);
        
        
        const selectedCat = categorylist.find(
          (c) => c.categoryId === data.categoryId
        );
        
        if (selectedCat) {
          setValue("categoryId", {
            value: selectedCat.categoryId,
            label: selectedCat.categoryName,
          });
        }

      
        const formattedQuestions = data.questionMasterDto.map((q) => ({
          questionId: q.questionId,
          title: q.questiontitle,
          options: q.options.map((opt) => ({
            optionId: opt.optionId,
            text: opt.optionValue,
          })),
          correctAnswer: q.options.findIndex((opt) => opt.isCorrect === true),
        }));

        console.log("Formatted questions:", formattedQuestions);
        
        setQuestions(formattedQuestions);
        setIsEdit(true);
        setEditCategoryId(data.categoryId);
        // toast.success("Data loaded for editing");
      } else {
        toast.error("Failed to load question paper for edit");
      }
    } catch (err) {
      console.error("Error loading edit data:", err);
      toast.error("Failed to load question paper for edit");
    } finally {
      setIsLoading(false);
      setOpenConfirm(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) {
        toast.error(`Question ${i + 1} title is required`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} must be filled`);
          return;
        }
      }
      if (q.correctAnswer === null || q.correctAnswer === undefined) {
        toast.error(`Please select correct answer for Question ${i + 1}`);
        return;
      }
    }

    const payload = {
      categoryId: isEdit ? editCategoryId : data.categoryId?.value,
     
      questionMasterDto: questions.map((q) => ({
        questiontitle: q.title,
        questionId: q.questionId || null,
        options: q.options.map((opt, oIndex) => ({
          optionId: opt.optionId || null,
          optionValue: opt.text,
          isCorrect: q.correctAnswer === oIndex,
        })),
      })),
    };

    console.log("Final payload:", payload);

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const encrypted = encryptPayload(payload);
      const res = await savequestionpaper(encrypted);

      if (res?.data?.outcome === true) {
    toast.success(res?.data?.message || (isEdit ? "Updated successfully" : "Created successfully"));
        resetForm();
        await fetchCategoryList();
      } else {
        toast.error(res?.data?.message || "Save failed");
      }
    } catch (err) {
      console.error("Error submitting question paper:", err);
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset({
      categoryId: null,
    });
    setQuestions([]);
    setIsEdit(false);
    setEditCategoryId(null);
    setRowToEdit(null);
  };

  const filteredData = (categoryTable || []).filter((row) =>
    (row?.categoryName || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName || "-",
    },
    {
      name: "Total Questions",
      selector: (row) => row.numberOfQuestion || 0,
    },
  {
  name: "Action",
  cell: (row) => (
    <ActionButtons
      row={row}
      onEdit={() => handleEdit(row)}
      showToggle={false}   
    />
  ),
}
  ];

  return (
    <>
     {isloading && <Loader/>}

      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
        <CardHeading props={isEdit ? "Edit Question Paper" : "Add Question Paper"} />
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#333" }}
              >
                Category Type
              </Typography>

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => {
                  const options = [
                    { value: "", label: "-- Select --" },
                    ...categorylist.map((t) => ({
                      value: t.categoryId,
                      label: t.categoryName,
                    })),
                  ];

                  return (
                    <Select
                      {...field}
                      options={options}
                      placeholder="Select Type of Category"
                      value={field.value}
                      isLoading={isloading}
                      isDisabled={isEdit} 
                      onChange={(option) => handleCategoryChange(option, field.onChange)}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: 8,
                          borderColor: errors.categoryId ? "#d32f2f" : "#ccc",
                          minHeight: 40,
                          width: "250px",
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  );
                }}
              />

              {errors.categoryId && (
                <Typography color="error" fontSize="12px" sx={{ mt: 0.5 }}>
                  {errors.categoryId.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Box mt={4}>
            <Box sx={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
           <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Questions
            </Typography>

            <Button
              variant="contained"
              startIcon={<MdAdd />}
              onClick={addQuestion}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              Add Question
            </Button>
            </Box>
            

            {questions.map((q, qIndex) => (
              <Box
                key={qIndex}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight="bold">
                    Question {qIndex + 1}
                  </Typography>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Question Title"
                  value={q.title}
                  onChange={(e) => {
                    const newList = [...questions];
                    newList[qIndex].title = e.target.value;
                    setQuestions(newList);
                  }}
                  sx={{ mt: 2 }}
                />

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel>Options (Select Correct Answer)</FormLabel>
                  <Grid container spacing={2} mt={1}>
                    {q.options.map((opt, oIndex) => (
                      <Grid item xs={12} sm={6} key={oIndex}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            border: "1px solid #ddd",
                          }}
                        >
                          <Radio
                            checked={q.correctAnswer === oIndex}
                            onChange={() =>
                              handleCorrectAnswerChange(qIndex, oIndex)
                            }
                          />
                          <TextField
                            size="small"
                            placeholder={`Option ${oIndex + 1}`}
                            value={opt.text}
                            onChange={(e) => {
                              const newList = [...questions];
                              newList[qIndex].options[oIndex].text =
                                e.target.value;
                              setQuestions(newList);
                            }}
                            fullWidth
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </FormControl>
              </Box>
            ))}
          </Box>

          <Box mt={4} sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={isSubmitting}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              {isEdit ? "Update" : "Submit"}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="error"
              onClick={resetForm}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </div>

      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4 mt-4">
        <CardHeading props={"Question Paper List"} />

        <div style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}>
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
          data={paginatedData}
          columns={columns}
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
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#333",
              }}
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
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </MuiSelect>
          </div>

          <Pagination
            count={Math.ceil(filteredData.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            variant="outlined"
            color="primary"
            size="medium"
          />
        </div>
      </div>

      <ReusableDialog
        open={openConfirm}
        title="Confirm Edit"
        description="Are you sure you want to edit this question paper ?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmEdit}
        disableBackdropClick={true}
      />
    </>
  );
};

export default AddQuestionPaper;