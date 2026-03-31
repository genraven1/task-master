package com.taskmaster.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class TaskStateException extends RuntimeException {
    public TaskStateException(String message) {
        super(message);
    }
}
