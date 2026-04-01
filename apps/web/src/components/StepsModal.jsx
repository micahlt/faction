import Modal from "./Modal";
import s from "../styles/modules/StepsModal.module.css";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { ArrowCircleRightIcon, CheckCircleIcon } from "@phosphor-icons/react";

export default function StepsModal({ steps = [], onComplete = () => { }, showCompleteButton = true }) {
    const [index, setIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState(steps[0]);
    useEffect(() => {
        setCurrentStep(steps[index]);
    }, [index])

    return <Modal>
        <div className={s.stepsModal}>
            <div className={s.content}>
                <h2>{currentStep.title}</h2>
                <p>{currentStep.content}</p>
                {!!currentStep.component ? currentStep.component : <></>}
                <br />
                {(index < steps.length - 1) ? <ArrowCircleRightIcon weight="duotone" cursor="pointer" color="var(--clr-primary)" size={36} onClick={() => setIndex((i) => i + 1)} /> : showCompleteButton ? <CheckCircleIcon weight="duotone" cursor="pointer" color="var(--clr-primary)" size={36} onClick={onComplete} /> : <></>}
            </div>
            <div className={s.steppers}>
                {steps.map((step, i) => <div key={i} className={classNames(s.stepper, { [s.active]: i == index })} onClick={() => {
                    setIndex(i);
                }} />)}
            </div>
        </div>
    </Modal>
}