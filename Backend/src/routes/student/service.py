from sqlalchemy.orm import Session
from fastapi import HTTPException

from .model import Student
from .schema import StudentCreate, StudentUpdate
from src.routes.log.services import log_action
from src.config.dependencies import check_user_validation_for_grade
from src.routes.grade.service import GradeService
from src.routes.elective_subject.service import ElectiveSubService
from src.routes.elective_subject.model import ElectiveSub


class StudentService:

    @staticmethod
    def create_student(db: Session, data: StudentCreate, user):
        check_user_validation_for_grade(db, user, data.grade_id)

        student_data = data.model_dump(exclude={"elective_subjects"})
        student = Student(**student_data)
        db.add(student)
        db.flush()        

        for ele in data.elective_subjects:
            mapping =ElectiveSub(student_id=student.id, sub_id=ele.sub_id, year=ele.year) 
            db.add(mapping)
        db.commit()
        db.refresh(student)

        log_action(
            db=db,
            user_id=user.id,
            action="CREATE",
            table_name="students and elective_subjects",
            record_id=student.id,
            old_data=None,
            new_data=data.model_dump(),
        )

        return student

    @staticmethod
    def get_all(db: Session, user):
        grade_id = GradeService.get_grade_by_user(user, db).id
        return db.query(Student).filter(Student.grade_id == grade_id).all()

    @staticmethod
    def get_by_id(db: Session, student_id: int):
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student

    @staticmethod
    def update_student(db: Session, student_id: int, data: StudentUpdate, user):
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        old_data = student.__dict__.copy()
        student_data = data.model_dump(exclude={"elective_subjects"})

        for field, value in student_data.model_dump(exclude_unset=True).items():
            setattr(student, field, value)

        if data.elective_subjects is not None:
            for ele in data.elective_subjects:            
                ElectiveSubService.update(db, ele, user)

        db.commit()
        db.refresh(student)

        log_action(
            db=db,
            user_id=user.id,
            action="UPDATE",
            table_name="students",
            record_id=student.id,
            old_data=old_data,
            new_data=data.model_dump(exclude_unset=True),
        )

        return student

    @staticmethod
    def toggle_active(db: Session, student_id: int, user):
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        old_data = {"is_active": student.is_active}
        student.is_active = not student.is_active

        db.commit()
        db.refresh(student)

        log_action(
            db=db,
            user_id=user.id,
            action="TOGGLE_ACTIVE",
            table_name="students",
            record_id=student_id,
            old_data=old_data,
            new_data={"is_active": student.is_active},
        )

        return student
