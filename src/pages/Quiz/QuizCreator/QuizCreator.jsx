import React, { useState, useMemo } from "react";
import Select from "react-select";
import {
  Box,
  Button,
  Checkbox,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import makeAnimated from "react-select/animated";
import CardHeading from "../../../components/common/CardHeading";
import Loader from "../../../components/common/Loader";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ReusableDialog from "../../../components/common/ReusableDialog";
import { TbEdit } from "react-icons/tb";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getquizCreatorAll,
  getFilterSubmit,
  quizListIdSend,
  quizCreatorSave,
  quizCreatorEdit,
  quizCreatorStatusChange,
} from "../../../services/QuizCreatorPage";
import { encryptPayload } from "../../../crypto/encryption";
import { toast } from "react-toastify";
import "./QuizCreator.css"; 
// import { set } from "react-hook-form";

const animatedComponents = makeAnimated();

const QuizCreator = () => {
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const [editConfirmDialogOpen, setEditConfirmDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [editLoading, setEditLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [savedQuizList, setSavedQuizList] = useState([]);

  const {
    data: quizData,
    isLoading: isQuizLoading,
    isError: isQuizError,
    error: quizError,
  } = useQuery({
    queryKey: ["quizCreatorData"],
    queryFn: getquizCreatorAll,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const quizOptions = useMemo(() => {
    return (
      quizData?.data?.data?.quizList?.map((quiz) => ({
        value: quiz.quizId,
        label: quiz.quizTitle,
      })) || []
    );
  }, [quizData]);

  const categoryOptions = useMemo(() => {
    return (
      quizData?.data?.data?.categoryList?.map((cat) => ({
        value: cat.categoryId,
        label: cat.categoryName,
      })) || []
    );
  }, [quizData]);

  const handleQuizChange = async (selected) => {
    setSelectedQuiz(selected);
    if (selected?.value) {
      setIsLoading(true);
      try {
        const payloadId = encryptPayload(selected.value);
        const response = await quizListIdSend(payloadId);
        if (response.data.outcome === true) {
          setSelectedQuiz(null)
          toast.error(
            response.data?.message || `Selected quiz: ${selected.label}`
          );
        }
      } catch {
        toast.error("Error selecting quiz. Please try again.");
      }finally{
        setIsLoading(false);
      }
    }
  };

  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected || []);
  };

  const handleFilter = async () => {
    if (!selectedQuiz || selectedCategories.length === 0) return;
    setIsLoading(true);
    try {
      const selectedCategoryIds = selectedCategories.map((cat) => cat.value);
      const encryptedIds = selectedCategoryIds.map((id) => encryptPayload(id));
      const response = await getFilterSubmit(encryptedIds);
      if (response?.data?.outcome) {
        setFilteredQuestions(response.data?.data || []);
        toast.success(
          response.data?.message || `Selected quiz: ${selectedQuiz?.label}`
        );
      } else {
        toast.error(response.data?.message || "Failed to fetch questions");
      }
    } catch {
      toast.error("Error filtering questions.");
      setFilteredQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (questionId) => {
    if (!selectedQuiz) {
      toast.info("Please select a quiz first.");
      return;
    }

    const quizInfo = quizData?.data?.data?.quizList?.find(
      (q) => q.quizId === selectedQuiz?.value
    );

    if (!quizInfo) {
      toast.error("Quiz details not found.");
      return;
    }

    const maxAllowed = quizInfo.noOfQuestion || 0;
    const isAlreadySelected = selectedQuestions.includes(questionId);

    if (!isAlreadySelected && selectedQuestions.length >= maxAllowed) {
      toast.warning(
        `Maximum ${maxAllowed} questions allowed for "${quizInfo.quizTitle}".`
      );
      return;
    }
    setSelectedQuestions((prev) =>
      isAlreadySelected
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedQuiz || selectedQuestions.length === 0) {
      toast.info("Please select a quiz and questions first.");
      return;
    }
    setIsLoading(true);

    try {
      
      const payload = {
        quizId: selectedQuiz.value,
        quizQuestionMapId: null,
        categoryId: null,
        categoryIdList: selectedCategories.map(cat => cat.value), // Add categoryIdList for multiple categories
        questionIds: selectedQuestions,
      };
      const encryptedPayload = encryptPayload(payload);
      const response = await quizCreatorSave(encryptedPayload);

      if (response?.data?.outcome === true) {
        toast.success(
          response.data?.message || "Quiz questions saved successfully!"
        );

        setSelectedQuestions([]);
        setFilteredQuestions([]);
        setSelectedCategories([]);
        setSelectedQuiz(null);

        setSavedQuizList([]);
        await queryClient.invalidateQueries({ queryKey: ["quizCreatorData"] });
      } else {
        toast.error(response.data?.message || "Failed to save questions.");
      }
    } catch {
      // toast.error("Error saving quiz questions.");
    }finally{
      setIsLoading(false);
    }
  };

  // --- Table columns for filtered questions
  const questionColumns = [
    {
  name: "Select",
  cell: (row) => (
    <Checkbox
      checked={selectedQuestions.includes(row.questionId)}
      onChange={() => handleCheckboxChange(row.questionId)}
      sx={{ color: "#3498db", "&.Mui-checked": { color: "#3498db" } }}
    />
  ),
  width: "80px",
  center: true,
},

    {
      name: "Question",
      selector: (row) => row.questiontitle,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      width: "120px",
      cell: (row, index) => {
        const color = getCategoryColor(index);
        return (
          <Chip
            label={row.cateGoryName || "Unknown"}
            sx={{
              backgroundColor: color.bg,
              color: color.text,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      },
      center: true,
    },
  ];

  // --- Table columns for saved list

  const handleEdit = async (row) => {
    setItemToEdit(row);
    setEditConfirmDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!itemToEdit) return;

    try {
      setEditLoading(true);

      const encryptedPayload = encryptPayload(itemToEdit.quizId);
      const response = await quizCreatorEdit(encryptedPayload);

      if (
        response?.data?.outcome === true &&
        response.data?.data?.quizMapping
      ) {
        const mapping = response.data.data.quizMapping;

        // Set the quiz selection
        const quizOption = quizOptions.find((q) => q.value === mapping.quizId);
        setSelectedQuiz(quizOption || null);

        // Set the category selection from categoryIdList
        let selectedCategoryOptions = [];
        if (mapping.categoryIdList && mapping.categoryIdList.length > 0) {
          selectedCategoryOptions = categoryOptions.filter((category) =>
            mapping.categoryIdList.includes(category.value)
          );
        }
        setSelectedCategories(selectedCategoryOptions);

        // Set the questions in the table
        const questions = mapping.questionDto || [];
        setFilteredQuestions(questions);

        // Set selected questions from questionIds
        const selectedQuestionIds = mapping.questionIds || [];
        setSelectedQuestions(selectedQuestionIds);

        toast.success(
          response.data.message || "Quiz details loaded for editing."
        );
      } else {
        toast.error(response.data?.message || "Failed to fetch quiz details.");
      }
    } catch (error) {
      console.error("Edit API error:", error);
      toast.error("Error fetching quiz details.");
    } finally {
      setEditConfirmDialogOpen(false);
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (row) => {
    const quizId = row.quizId;

    setToggleLoading(true);

    try {
      const newStatus = !row.mappingStatus;

      const response = await quizCreatorStatusChange(quizId, newStatus);

      if (response?.data?.outcome === true) {
        await queryClient.invalidateQueries({ queryKey: ["quizCreatorData"] });
      } else {
        toast.error(response.data?.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error("Error updating quiz mapping status.");
      console.error("Status change error:", error);
    } finally {
      setToggleLoading(false);
    }
  };

  const quizMappingColumns = [
    {
      name: "Sl. No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Quiz Name",
      selector: (row) => row.quizName,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title="Edit">
            <span>
              <IconButton
                size="small"
                onClick={() => handleEdit(row)}
                disabled={!row.mappingStatus}
                sx={{
                  backgroundColor: !row.mappingStatus ? "#725d5d9c" : "#1976d2",
                  color: "#fff",
                  borderRadius: "8px",
                  width: "28px",
                  height: "28px",
                  cursor: !row.mappingStatus ? "not-allowed" : "pointer",
                  "&.Mui-disabled": {
                    backgroundColor: "#725d5d5c",
                    color: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: !row.mappingStatus
                      ? "#725d5d9c"
                      : "#1565c0",
                  },
                }}
              >
                <TbEdit style={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={row.mappingStatus ? "Deactivate" : "Activate"}>
            {toggleLoading[row.quizId] ? (
              <CircularProgress size={24} />
            ) : (
              <IconButton
                size="small"
                onClick={() => handleToggleStatus(row)}
                sx={{
                  width: "42px",
                  height: "42px",
                  color: row.mappingStatus ? "#4caf50" : "#f44336",
                }}
              >
                {row.mappingStatus ? (
                  <ToggleOnIcon fontSize="large" />
                ) : (
                  <ToggleOffIcon fontSize="large" />
                )}
              </IconButton>
            )}
          </Tooltip>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const getCategoryColor = (id) => {
    const colors = [
      { bg: "#e3f2fd", text: "#1565c0" },
      { bg: "#e8f5e9", text: "#2e7d32" },
      { bg: "#fff3e0", text: "#ef6c00" },
      { bg: "#fce4ec", text: "#c2185b" },
      { bg: "#e8eaf6", text: "#303f9f" },
    ];
    return colors[id % colors.length] || { bg: "#f5f5f5", text: "#757575" };
  };



  if (isQuizLoading || isLoading || toggleLoading || editLoading)
    return <Loader loading={true} />;

  if (isQuizError)
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "white",
          textAlign: "center",
          color: "red",
        }}
      >
        <Typography variant="h6">
          Error loading data: {quizError?.message || "Failed to load quiz data"}
        </Typography>
      </Box>
    );

  return (
    <>
      {/* Confirmation Dialog for edit action */}
      <ReusableDialog
        open={editConfirmDialogOpen}
        title="Confirm Edit"
        description={
          itemToEdit
            ? `Are you sure you want to edit the quiz mapping for "${itemToEdit.quizName}"?`
            : ""
        }
        onClose={() => setEditConfirmDialogOpen(false)}
        onConfirm={confirmEdit}
      />

      {/* Filter Panel */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "15px",
        }}
      >
        <CardHeading props=" Quiz Question Selector" />

        <div className="">
          <Box display="flex" alignItems="center" gap={2} width={800}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                Quiz <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                options={quizOptions}
                value={selectedQuiz}
                onChange={handleQuizChange}
                placeholder="Choose a quiz..."
                isClearable
                isDisabled={!quizOptions.length}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                Category <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                className="quiz-creator-category-select" 
                components={animatedComponents}
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={handleCategoryChange}
                placeholder="Choose categories..."
                isClearable
                closeMenuOnSelect={false}
                isDisabled={!categoryOptions.length}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  menuList: (base) => ({ ...base, maxHeight: '200px' }),
                  control: (base) => ({
                    ...base,
                    minHeight: '40px',
                    height: '40px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flexWrap: 'nowrap',
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    minHeight: '40px',
                    height: '40px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flexWrap: 'nowrap',
                    padding: '0 8px',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    minWidth: 'fit-content',
                  }),
                }}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleFilter}
                disabled={!selectedQuiz || !selectedCategories.length}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  setFilteredQuestions([]);
                  setSelectedQuestions([]);
                  setSelectedCategories([]);
                  setSelectedQuiz(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </div>
      </Box>

      {/* Quiz Mapping List Table (Default view) */}
      {quizData?.data?.data?.quizMappingList &&
        quizData.data.data.quizMappingList.length > 0 &&
        filteredQuestions.length === 0 &&
        savedQuizList.length === 0 && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "15px",
            }}
          >
            <CardHeading
              props={`Quiz Mapping List (${quizData.data.data.quizMappingList.length})`}
            />
            <ReusableDataTable
              data={quizData.data.data.quizMappingList}
              columns={quizMappingColumns}
            />
          </Box>
        )}

      {/* Filtered Questions Table */}
      {filteredQuestions.length > 0 && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "15px",
          }}
        >
          <CardHeading
            props={`Quiz Question List (${filteredQuestions.length})`}
          />
          <ReusableDataTable
            data={filteredQuestions}
            columns={questionColumns}
          />

          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 2,
              backgroundColor: "#ecf0f1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#2c3e50", fontWeight: 500 }}>
              <strong>{selectedQuestions.length}</strong> questions selected
            </Typography>
            <div className="flex gap-1">
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSubmit}
                disabled={!selectedQuestions.length}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  setFilteredQuestions([]);
                  setSelectedQuestions([]);
                  setSelectedCategories([]);
                  setSelectedQuiz(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Box>
      )}
    </>
  );
};

export default QuizCreator;
