from sqlalchemy.orm import Session
from fastapi import HTTPException

from .model import ElectiveSub
from .schema import ElectiveSubCreate, ElectiveSubResponse, ElectiveSubUpdate
from src.routes.log.services import log_action
from src.routes.student.model import Student
from src.routes.grade.service import GradeService
from src.routes.year.service import YearService
from src.config.dependencies import check_user_validation_for_grade



class ElectiveSubService:

    @staticmethod
    def create(db: Session, data: ElectiveSubCreate, user, student_id: int):
        grade_id = GradeService.get_grade_by_user(user, db).id
        check_user_validation_for_grade(db, user, grade_id)
        current_year = YearService.get_current(db).year
        electives = db.query(ElectiveSub).filter(ElectiveSub.student_id == student_id).filter(ElectiveSub.year == current_year).all()
        if len(electives) >= GradeService.get_elective_count(db, grade_id):
            raise HTTPException(status_code=400, detail="Elective subject limit reached for the student in this grade")
        data.student_id = student_id
        elective = ElectiveSub(**data.model_dump())
        db.add(elective)
        db.commit()
        db.refresh(elective)

        log_action(
            db=db,
            user_id=user.id,
            action="CREATE",
            table_name="elective_subjects",
            record_id=elective.id,
            old_data=None,
            new_data=data.model_dump(),
        )

        return elective

    @staticmethod
    def get_all(db: Session, user):
        grade_id=GradeService.get_grade_by_user(user, db).id
        current_year = YearService.get_current(db).year
        student_with_elective=(
            db.query(Student, ElectiveSub)
            .outerjoin(ElectiveSub, (Student.id==ElectiveSub.student_id) & (ElectiveSub.year==current_year))
            .filter(Student.grade_id==grade_id, Student.is_active==True)
            .all()
                        )
        if not student_with_elective:
            raise HTTPException(status_code=404, detail="No Student found")
        
        student_dict = {}
        for student, elective in student_with_elective:
            if student.id not in student_dict:
                student_dict[student.id] = {
                    "id": student.id,
                    "roll": student.roll,
                    "name": student.name,
                    "elective_subjects": [],
                }
            if elective:
                student_dict[student.id]["elective_subjects"].append(
                    ElectiveSubResponse(**elective.__dict__)
                )
                
        return list(student_dict.values())


    @staticmethod
    def get_by_student(db: Session, student_id: int):
        return db.query(ElectiveSub).filter(ElectiveSub.student_id == student_id).all()

   

    # In service.py, ensure the update method exists
    @staticmethod
    def update(db: Session, data: ElectiveSubUpdate, user):
        grade_id = GradeService.get_grade_by_user(user, db).id
        check_user_validation_for_grade(db, user, grade_id)
        elective = db.query(ElectiveSub).filter(ElectiveSub.id == data.id).first()
        if not elective:
            raise HTTPException(status_code=404, detail="Elective subject not found")

        # Update only the sub_id (subject code) and keep other fields
        elective.sub_id = data.sub_id
        elective.year = data.year if data.year else elective.year
        elective.student_id = data.student_id if data.student_id else elective.student_id

        db.commit()
        db.refresh(elective)

        log_action(
            db=db,
            user_id=user.id,
            action="UPDATE",
            table_name="elective_subjects",
            record_id=elective.id,
            old_data=elective.__dict__,
            new_data=data.model_dump(exclude_unset=True),
        )

        return elective