#this file is in the root of the course
COURSE_DIR =	$(patsubst %/,%, $(dir $(firstword $(MAKEFILE_LIST))))

#added only for zdu-umt2pdf
COURSE = 	$(shell basename $$(realpath $(HOME_DIR)))
PWD=$(shell pwd)

TEMPLATE_DIR =  $(HOME_DIR)/assets/umt

UMT_FILES = $(wildcard ./*.umt)
HTML_FILES = $(subst .umt,.html,$(UMT_FILES)) 

TARGETS = $(HTML_FILES)

UMT = $(HOME)/projects/umt.ts/dist/platforms/node/main.js


all:		$(TARGETS)

.phony:		clean

clean:
		rm -rf *~ $(TARGETS)

%.html:		%.umt
		node $(UMT) -D HOME=$(COURSE_DIR) \
		       -D DOC-CLASS="umt-article" \
                       -t $(COURSE_DIR)/assets/umt/template.html \
                       $<  > $@


