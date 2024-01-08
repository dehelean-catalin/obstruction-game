package com.example.backendobstruction.exceptions;

import com.example.backendobstruction.exceptions.ErrorMessage;
import jakarta.servlet.http.HttpServletRequest;
 import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler({NumberFormatException.class, IllegalArgumentException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorMessage handleControllerException(HttpServletRequest request,
                                                  Throwable ex) {
        return new ErrorMessage("EROARE_TABLA", ex.getMessage(), HttpStatus.BAD_REQUEST.value());
    }

}


