<?php include('header_dashboard.php'); ?>
<?php include('session.php'); ?>
<?php $get_id = $_GET['id']; ?>
<?php $quiz_question_id = $_GET['quiz_question_id']; ?>
<body>
		<?php include('navbar_teacher.php'); ?>
        <div class="container-fluid">
            <div class="row-fluid">
				<?php include('quiz_sidebar_teacher.php'); ?>
                <div class="span9" id="content">
                     <div class="row-fluid">
					    <!-- breadcrumb -->
									<ul class="breadcrumb">
										<?php
										$school_year_query = mysqli_query($conn,"select * from school_year order by school_year DESC")or die(mysqli_error());
										$school_year_query_row = mysqli_fetch_array($school_year_query);
										$school_year = $school_year_query_row['school_year'];
										?>
										<li><a href="#"><b>My Class</b></a><span class="divider">/</span></li>
										<li><a href="#">School Year: <?php echo $school_year_query_row['school_year']; ?></a><span class="divider">/</span></li>
										<li><a href="#"><b>Quiz Question</b></a></li>
									</ul>
						 <!-- end breadcrumb -->
                        <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-right">
								<a href="quiz_question.php<?php echo '?id='.$get_id; ?>" class="btn btn-success"><i class="icon-arrow-left"></i> Back</a>
								</div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
								<?php
										$query = mysqli_query($conn,"select * FROM quiz_question
										LEFT JOIN question_type on quiz_question.question_type_id = question_type.question_type_id
										where quiz_id = '$get_id' and quiz_question_id = '$quiz_question_id'  order by date_added DESC ")or die(mysqli_error());
										$row = mysqli_fetch_array($query);
								?>

							    <form class="form-horizontal" method="post">
								        <div class="control-group">
											<label class="control-label" for="inputPassword">Question</label>
											<div class="controls">
													<textarea name="question" id="ckeditor_full" required><?php echo $row['question_text']; ?></textarea>
											</div>
										</div>
										<!-- <div class="control-group">
											<label class="control-label" for="inputEmail">Points</label>
											<div class="controls">

											<input type="number" class="span1" name="points" min=1 max=5 required>
											</div>
										</div> -->
										<div class="control-group">
											<label class="control-label" for="inputEmail">Question Type:</label>
											<div class="controls">
												<select id="qtype" name="question_tpye" required>

														<option value="<?php echo $row['question_type_id']; ?>" ><?php echo $row['question_type']; ?></option>
													<?php
													$query_question = mysqli_query($conn,"select * from question_type")or die(mysqli_error());
													while($query_question_row = mysql_fetch_array($query_question)){
													?>
													<option value="<?php echo $query_question_row['question_type_id']; ?>"><?php echo $query_question_row['question_type'];  ?></option>
													<?php } ?>

												</select>
											</div>
										</div>
										<div class="control-group">
											<label class="control-label" for="inputEmail"></label>
											<div class="controls">
										<div id="opt11">
<?php
	$sqlz = mysqli_query($conn,"SELECT * FROM answers WHERE q_id = ".$_GET['edit']."");
	while($rowz = mysqli_fetch_array($sqlz)){
		if($rowz['choice'] == 'A'){
			$a = $rowz['value'];
		} else if($rowz['choice'] == 'B'){
			$b = $rowz['value'];
		} else if($rowz['choice'] == 'C'){
			$c = $rowz['value'];
		} else if($rowz['choice'] == 'D'){
			$d = $rowz['value'];
		}
	}
?>
	A.)<input type="text" name="ans1" size="60" value="<?php echo $a;?>"><input name="correctm" value="A" <?php if($rowa['correct'] == 'A'){ echo 'checked'; }?> type="radio"><br /><br />
	B.)<input type="text" name="ans2" size="60" value="<?php echo $b;?>"><input name="correctm" value="B" <?php if($rowa['correct'] == 'B'){ echo 'checked'; }?> type="radio"><br /><br />
	C.)<input type="text" name="ans3" size="60" value="<?php echo $c;?>"><input name="correctm" value="C" <?php if($rowa['correct'] == 'C'){ echo 'checked'; }?> type="radio"><br /><br />
	D.)<input type="text" name="ans4" size="60" value="<?php echo $d;?>"><input name="correctm" value="D" <?php if($rowa['correct'] == 'D'){ echo 'checked'; }?> type="radio"><br /><br />
</div>
<div id="opt12">
	<input name="correctt" <?php if($row['answer'] == 'True'){ echo 'checked'; }?> value="t" type="radio">True<br /><br />
	<input name="correctt" <?php if($row['answer'] == 'False'){ echo 'checked'; }?> value="f" type="radio">False<br /><br />
</div>
											</div>
										</div>




						<div class="control-group">
										<div class="controls">

										<button name="save" type="submit" class="btn btn-info"><i class="icon-save"></i> Save</button>
										</div>
										</div>


		</form>

		<?php
		if (isset($_POST['save'])){
		$question = $_POST['question'];
		$points = $_POST['points'];
		$type = $_POST['question_tpye'];
		$answer = $_POST['answer'];

		$ans1 = $_POST['ans1'];
		$ans2 = $_POST['ans2'];
		$ans3 = $_POST['ans3'];
		$ans4 = $_POST['ans4'];

		if ($type  == '2'){
				mysqli_query($conn,"insert into quiz_question (quiz_id,question_text,date_added,answer,question_type_id)
			values('$get_id','$question',NOW(),'".$_POST['correctt']."','$type')")or die(mysqli_error());
		}else{

		mysqli_query($conn,"insert into quiz_question (quiz_id,question_text,date_added,answer,question_type_id)
		values('$get_id','$question',NOW(),'$answer','$type')")or die(mysqli_error());
		$query = mysqli_query("select * from quiz_question order by quiz_question_id DESC LIMIT 1")or die(mysqli_error());
		$row = mysqli_fetch_array($query);
		$quiz_question_id = $row['quiz_question_id'];

		mysqli_query("insert into answer (quiz_question_id,answer_text,choices) values('$quiz_question_id','$ans1','A')")or die(mysqli_error());
		mysqli_query("insert into answer (quiz_question_id,answer_text,choices) values('$quiz_question_id','$ans2','B')")or die(mysqli_error());
		mysqli_query("insert into answer (quiz_question_id,answer_text,choices) values('$quiz_question_id','$ans3','C')")or die(mysqli_error());
		mysqli_query("insert into answer (quiz_question_id,answer_text,choices) values('$quiz_question_id','$ans4','D')")or die(mysqli_error());

		}

	?>
		<script>
 		window.location = 'quiz_question.php<?php echo '?id='.$get_id; ?>'
		</script>
		<?php
		}
		?>
                                </div>
                            </div>
                        </div>
                        <!-- /block -->
                    </div>
                </div>
            </div>
					<script>
	jQuery(document).ready(function(){
		jQuery("#opt11").hide();
		jQuery("#opt12").hide();
		jQuery("#opt13").hide();

		jQuery("#qtype").change(function(){
			var x = jQuery(this).val();
			if(x == '1') {
				jQuery("#opt11").show();
				jQuery("#opt12").hide();
				jQuery("#opt13").hide();
			} else if(x == '2') {
				jQuery("#opt11").hide();
				jQuery("#opt12").show();
				jQuery("#opt13").hide();
			}
		});

	});
</script>
		<?php include('footer.php'); ?>
        </div>
		<?php include('script.php'); ?>
    </body>
</html>
